// src/queue/queue.module.ts
import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VideoProcessor } from './video.processor';
import { VideosModule } from 'src/videos/videos.module';

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
    VideosModule, // needed for VideosService
  ],
  providers: [VideoProcessor],
  exports: [BullModule],
})
export class QueueModule {}
