import { PrismaService } from 'src/prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dtos/create-videos.dto';
import { UpdateVideoDto } from './dtos/update-videos.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('video-processing') private queue: Queue,
  ) {}

  async createVideo(
    userId: number,
    dto: CreateVideoDto & { sourceUrl: string; thumbnail?: string | null },
  ) {
    const video = await this.prisma.video.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        sourceUrl: dto.sourceUrl,
        thumbnail: dto.thumbnail || null,
        sourceType: dto.sourceType || 'upload',
        status: 'pending',
      },
    });

    // Add job to queue — method name in processor must be generateClips
    await this.queue.add('generate-clips', { videoId: video.id });

    return video;
  }

  async findAllByUser(userId: number) {
    return this.prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        sourceUrl: true,
        thumbnail: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number, userId: number) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });

    if (!video) throw new NotFoundException('Video not found');
    if (video.userId !== userId)
      throw new BadRequestException('You do not have access to this video');

    return video;
  }

  async updateVideo(id: number, userId: number, dto: UpdateVideoDto) {
    await this.checkOwnership(id, userId);

    return this.prisma.video.update({
      where: { id },
      data: dto,
    });
  }

  async deleteVideo(id: number, userId: number) {
    await this.checkOwnership(id, userId);

    return this.prisma.video.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.video.update({
      where: { id },
      data: { status },
    });
  }

  private async checkOwnership(id: number, userId: number) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!video) throw new NotFoundException('Video not found');
    if (video.userId !== userId)
      throw new BadRequestException('You do not have access to this video');
  }
}
