import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { VideosService } from 'src/videos/videos.service';

@Processor('video-processing')
export class VideoProcessor {
  constructor(private readonly videosService: VideosService) {}

  @Process('generate-clips')
  async generateClips(job: Job<{ videoId: number }>) {
    const { videoId } = job.data;

    console.log(`Processing video ID: ${videoId}`);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    await this.videosService.updateStatus(videoId, 'completed');

    console.log(`Clips generated for video ${videoId}`);
  }
}
