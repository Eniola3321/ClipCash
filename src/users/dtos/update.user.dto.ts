import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsUrl()
  picture?: string;
}
