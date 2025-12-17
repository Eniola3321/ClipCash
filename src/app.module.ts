import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthsModule } from './auths/auths.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthsModule,
    UsersModule,
    VideosModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
