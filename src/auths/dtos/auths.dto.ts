import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
