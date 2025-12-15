import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategy/jwtStrategy';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthsController],
  providers: [AuthsService, JwtStrategy, GoogleStrategy, PrismaService],
})
export class AuthsModule {}
