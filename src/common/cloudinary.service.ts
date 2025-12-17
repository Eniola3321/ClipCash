// src/common/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder = 'clipcash/videos',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Video upload failed'));
          resolve(result);
        },
      );

      upload.end(file.buffer);
    });
  }

  async uploadThumbnail(
    imageBuffer: Buffer,
    publicId: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: publicId,
          folder: 'clipcash/thumbnails',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Thumbnail upload failed'));
          resolve(result);
        },
      );

      upload.end(imageBuffer);
    });
  }
}
