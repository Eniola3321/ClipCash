// src/queue/queue.module.ts
import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VideoProcessor } from './video.processor';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VideosModule } from 'src/videos/videos.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'video-processing',
    }),
    PrismaModule,
    VideosModule,
  ],
  providers: [VideoProcessor, CloudinaryService, PrismaService],
  exports: [BullModule],
})
export class QueueModule {}
