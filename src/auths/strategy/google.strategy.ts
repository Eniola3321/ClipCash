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
      accessType: 'offline',
      prompt: 'consent',
    });
    console.log({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log('🔑 Google Access Token:', accessToken?.slice(0, 20) + '...');
    console.log('🔄 Google Refresh Token:', refreshToken ? 'YES' : 'NO');
    console.log('👤 Google Profile ID:', profile.id);
    console.log('📧 Email:', profile.emails?.[0]?.value);

    const user = await this.authsService.ValidateOAuthUsers({
      provider: 'google',
      providerId: profile.id,
      email: profile.emails[0].value,
      name: profile.name?.givenName || profile.displayName,
    });

    done(null, user);
  }
}
