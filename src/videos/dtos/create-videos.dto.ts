import { IsOptional, IsString, IsUrl, IsIn } from 'class-validator';
export class CreateVideoDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsIn(['upload', 'youtube', 'tiktok', 'vimeo'])
  sourceType: 'youtube' | 'vimeo' | 'upload' | 'tiktok';

  @IsUrl()
  sourceUrl: string;
}
