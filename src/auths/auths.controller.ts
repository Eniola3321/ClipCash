import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsDto } from './dtos/auths.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auths')
export class AuthsController {
  constructor(private authsService: AuthsService) {}
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthsDto) {
    return this.authsService.signup(dto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthsDto) {
    return this.authsService.signin(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthsCallback(@Req() req) {
    const user = req.user;
    const token = await this.authsService.signToken(user.id);
    return { message: 'Google authentication successful', token, user };
  }
}
