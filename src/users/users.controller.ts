import { UpdateUserDto } from './dtos/update.user.dto';
import { ChangePasswordDto } from './dtos/change.password.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Controller,
  Get,
  Req,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Get('me')
  async getProfile(@Req() req) {
    return await this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return await this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('me/password')
  async changePassword(@Req() Req, @Body() dto: ChangePasswordDto) {
    return await this.usersService.changePassword(Req.user.id, dto);
  }
  @Delete('me')
  async deleteMyAccount(@Req() req) {
    return await this.usersService.deleteAccount(req.user.id);
  }
}
