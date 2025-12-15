import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthsService } from '../auths.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authsService: AuthsService,
    private config: ConfigService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
    console.log(
      'PASSPORT GOOGLE CALLBACK URL =',
      config.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { email, name } = profile;
    const user = await this.authsService.ValidateOAuthUsers({
      provider: 'google',
      providerId: profile.id,
      email,
      name: name.givenName,
    });

    done(null, user);
  }
}
