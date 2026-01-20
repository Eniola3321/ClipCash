import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary.service';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log('FFmpeg path:', ffmpegInstaller.path);

@Processor('video-processing')
export class VideoProcessor {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Process('generate-clips')
  async generateClips(job: Job<{ videoId: number }>) {
    const { videoId } = job.data;

    console.log(`Processing video ID: ${videoId}`);
    const video = await this.prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      console.error(`Video with ID ${videoId} not found.`);
      return;
    }
    const videoUrl = video.sourceUrl;
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'clips-'));
    const videoPath = path.join(tempDir, `video-${videoId}.mp4`);
    console.log(`Downloading video to ${videoPath}`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoUrl)
        .output(videoPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration || 0);
      });
    });
    const clipsDuration = 30;
    const numClips = Math.floor(duration / clipsDuration);
    console.log(`generating ${numClips} clips...`);
    for (let i = 0; i < numClips; i++) {
      const start = i * clipsDuration;
      const clipPath = path.join(tempDir, `Clip-${i}.mp4`);
      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime(start)
          .setDuration(clipsDuration)
          .output(clipPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      const clipBuffer = await fs.promises.readFile(clipPath);
      const ClipUpload = await this.cloudinaryService.uploadVideo({
        buffer: clipBuffer,
        originalname: `clip-${videoId}-${i}.mp4`,
      } as any);
      await this.prisma.clip.create({
        data: {
          videoId,
          clipUrl: ClipUpload.secure_url,
          platform: 'tiktok',
          startTime: start,
          endTime: start + clipsDuration,
          duration: clipsDuration,
          title: `Clip ${i + 1} of Video ${video.title || 'video'} `,
        },
      });
      console.log(`Generated clip ${i + 1} uploaded: ${ClipUpload.secure_url}`);
    }
    await fs.promises.rm(tempDir, { recursive: true, force: true });
    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'completed',
      },
    });

    console.log(`Clips generated for video ${videoId}`);
  }
}
