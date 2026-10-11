import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Inject,
  ParseUUIDPipe,
  UploadedFiles,
  ValidationPipe,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { CreateVideoUseCase } from '../../core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '../../core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '../../core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { UploadImageMediasUseCase } from '../../core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';
import { UploadImageMediasInput } from '../../core/video/application/use-cases/upload-image-medias/upload-image-medias.input';
import { GetVideoUseCase } from '../../core/video/application/use-cases/get-video/get-video.use-case';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UpdateVideoInput } from '../../core/video/application/use-cases/update-video/update-video.input';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadAudioVideoMediaInput } from '../../core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-media.input';
import { VideoPresenter, VideoCollectionPresenter } from './videos.presenter';
import { ListVideosUseCase } from '../../core/video/application/use-cases/list-videos/list-videos.use-case';
import { SearchVideosDto } from './dto/search-videos.dto';
import { DeleteVideoUseCase } from '../../core/video/application/use-cases/delete-video/delete-video.use-case';

import { AuthGuard } from '../auth-module/auth.guard';

@UseGuards(AuthGuard)
@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase | undefined;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase | undefined;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMedia: UploadAudioVideoMediasUseCase | undefined;

  @Inject(UploadImageMediasUseCase)
  private uploadImageMedia: UploadImageMediasUseCase | undefined;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase | undefined;

  @Inject(ListVideosUseCase)
  private listUseCase!: ListVideosUseCase;

  @Inject(DeleteVideoUseCase)
  private deleteUseCase!: DeleteVideoUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase!.execute(createVideoDto);
    //return await this.getUseCase!.execute({ id });
    //VideoPresenter
    const output = await this.getUseCase!.execute({ id });
    return new VideoPresenter(output);
  }

  @Get()
  async search(@Query() query: SearchVideosDto) {
    const output = await this.listUseCase.execute({
      page: query.page,
      per_page: query.per_page,
      filter: {
        title: query.title,
        categories_id: query.categories_id,
        genres_id: query.genres_id,
        cast_members_id: query.cast_members_id,
      },
    });

    return new VideoCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    //return await this.getUseCase!.execute({ id });
    //VideoPresenter
    const output = await this.getUseCase!.execute({ id });
    return new VideoPresenter(output);
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: any,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasFiles = files ? Object.keys(files).length : false;
    const hasData = Object.keys(updateVideoDto ?? {}).length > 0;

    if (hasFiles && hasData) {
      throw new BadRequestException('Files and data cannot be sent together');
    }

    if (hasData) {
      const data = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(updateVideoDto, {
        metatype: UpdateVideoDto,
        type: 'body',
      });
      const input = new UpdateVideoInput({ id, ...data });
      await this.updateUseCase!.execute(input);
    }

    if (!hasFiles) {
      return await this.getUseCase!.execute({ id });
    }

    const hasMoreThanOneFile = Object.keys(files).length > 1;

    if (hasMoreThanOneFile) {
      throw new BadRequestException('Only one file can be sent');
    }

    const hasAudioVideoMedia = files.trailer?.length || files.video?.length;
    const fieldField = Object.keys(files)[0];
    const file = files[fieldField][0];

    if (hasAudioVideoMedia) {
      const dto: UploadAudioVideoMediaInput = {
        video_id: id,
        field: fieldField as any,
        file: {
          raw_name: file.originalname,
          data: file.buffer,
          mime_type: file.mimetype,
          size: file.size,
        },
      };

      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(dto, {
        metatype: UploadAudioVideoMediaInput,
        type: 'body',
      });

      await this.uploadAudioVideoMedia!.execute(input);
    } else {
      const dto: UploadImageMediasInput = {
        video_id: id,
        field: fieldField as any,
        file: {
          raw_name: file.originalname,
          data: file.buffer,
          mime_type: file.mimetype,
          size: file.size,
        },
      };

      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(dto, {
        metatype: UploadImageMediasInput,
        type: 'body',
      });

      await this.uploadImageMedia!.execute(input);
    }
    return await this.getUseCase!.execute({ id });
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
    id: string,
  ): Promise<void> {
    await this.deleteUseCase.execute({ id });
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id/upload')
  async uploadFile(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasMoreThanOneFile = Object.keys(files).length > 1;

    if (hasMoreThanOneFile) {
      throw new BadRequestException('Only one file can be sent');
    }

    const hasAudioVideoMedia = files.trailer?.length || files.video?.length;
    const fieldField = Object.keys(files)[0];
    const file = files[fieldField][0];

    if (hasAudioVideoMedia) {
      const dto: UploadAudioVideoMediaInput = {
        video_id: id,
        field: fieldField as any,
        file: {
          raw_name: file.originalname,
          data: file.buffer,
          mime_type: file.mimetype,
          size: file.size,
        },
      };

      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(dto, {
        metatype: UploadAudioVideoMediaInput,
        type: 'body',
      });

      await this.uploadAudioVideoMedia!.execute(input);
    } else {
      //use case upload image media
      const dto: UploadImageMediasInput = {
        video_id: id,
        field: fieldField as UploadImageMediasInput['field'],
        file: {
          raw_name: file.originalname,
          data: file.buffer,
          mime_type: file.mimetype,
          size: file.size,
        },
      };

      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(dto, {
        metatype: UploadImageMediasInput,
        type: 'body',
      });

      await this.uploadImageMedia!.execute(input);
    }
    return await this.getUseCase!.execute({ id });
  }
}
