import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Req,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CreateVideoDto } from './dtos/create-videos.dto';
import { UpdateVideoDto } from './dtos/update-videos.dto';
import { VideosService } from './videos.service';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('videos')
export class VideosController {
  constructor(
    private videosService: VideosService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createVideo(
    @Req() req,
    @Body() dto: CreateVideoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Validation: Either file or sourceUrl must be provided
    if (!file && !dto.sourceUrl) {
      throw new BadRequestException(
        'Either file upload or sourceUrl is required',
      );
    }

    let sourceUrl = dto.sourceUrl;
    let thumbnail: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadVideo(file);

      sourceUrl = uploadResult.secure_url;

      thumbnail = uploadResult.poster_url || null;
    }
    console.log('Debug: Creating video with values:', {
      userId: req.user.id,
      dto,

      sourceType: dto.sourceType,
      computedSourceType: file ? 'upload' : 'youtube',
      sourceUrl,
      thumbnail,
    });
    return await this.videosService.createVideo(req.user.id, {
      ...dto,
      sourceUrl: sourceUrl as string,
      sourceType: file ? 'upload' : 'youtube',
      thumbnail: thumbnail ?? undefined,
    });
  }

  @Get()
  async findAll(@Req() req) {
    return await this.videosService.findAllByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return await this.videosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async updateVideo(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVideoDto,
  ) {
    return await this.videosService.updateVideo(id, req.user.id, dto);
  }

  @Delete(':id')
  async deleteVideo(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return await this.videosService.deleteVideo(id, req.user.id);
  }
}
