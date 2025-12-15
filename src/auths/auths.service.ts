import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthsDto } from './dtos/auths.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async signup(dto: AuthsDto) {
    try {
      const hash = await argon2.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });

      return this.signToken(user.id);
    } catch (error: any) {
      // Prisma unique constraint (email already exists)
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }

      throw new InternalServerErrorException('Signup failed');
    }
  }

  async signin(dto: AuthsDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await argon2.verify(user.password, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id);
  }
  async ValidateOAuthUsers(oauthData: {
    email: string;
    provider: string;
    providerId: string;
    name?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
        },
      },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthData.email,
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          name: oauthData.name,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          name: oauthData.name,
        },
      });
    }
    return user;
  }
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password) {
      const isMatch = await argon2.verify(user.password, password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
  }
  signToken(userId: number): { access_token: string } {
    const payload = { sub: userId };
    const secret = this.config.get<string>('JWT_SECRET_KEY');

    if (!secret) {
      throw new InternalServerErrorException('JWT secret not configured');
    }

    const token = this.jwt.sign(payload, {
      expiresIn: '15m',
      secret,
    });

    return { access_token: token };
  }
}
