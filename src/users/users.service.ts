import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update.user.dto';
import { ChangePasswordDto } from './dtos/change.password.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateProfile(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: dto.name,
        picture: dto.picture,
      },

      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
      },
    });

    return user;
  }
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.password) {
      throw new BadRequestException(
        'Password change not allowed for OAuth users',
      );
    }
    const isMatch = await argon2.verify(user.password, dto.oldPassword);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    const hash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hash,
      },
    });
    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'Account deleted successfully' };
  }
}
