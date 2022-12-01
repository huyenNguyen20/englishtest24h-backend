import {
  BadRequestException,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Response,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UploadService } from './upload.service';
import LocalFilesInterceptor from './upload.interceptor';


require('dotenv').config();

@ApiTags('Upload Endpoints')
@Controller('/upload')
@UseGuards()
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'xlsx', maxCount: 1 },
  ]),
)
export class UploadController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private readonly uploadService: UploadService,
  ) {}

  @ApiOperation({ summary: 'Method for EXAM OWNER to upload image' })
  @Post('/image')
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'image',
      path: '/image',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('Provide a valid image file'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async postImage(@UploadedFiles() files, @Response() res) {
    try {
      const file = files?.image[0] || null;
      if (!file) throw new Error('File not found');
      const imageUrl = await this.uploadService.compressAndUploadImageV2(
        file.buffer,
        file.originalname
      );
      return res.status(HttpStatus.OK).json({ results: imageUrl });
    } catch (e) {
      this.logger.error(`ERROR in POST /upload/audio ${JSON.stringify(e)}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong with uploading. Please try again!',
      });
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to upload audio' })
  @Post('/audio')
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'audio',
      path: '/audio',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('audio')) {
          return callback(
            new BadRequestException('Provide a valid audio file'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async postAudio(@UploadedFiles() files, @Response() res) {
    try {
      const file = files?.audio[0] || null;
      if (!file) throw new Error('File not found');
      const audioUrl = await this.uploadService.upload(
        file.buffer,
        file.originalname,
        'audio',
      );
      return res.status(HttpStatus.OK).json({ results: audioUrl });
    } catch (e) {
      this.logger.error(`ERROR in POST /upload/audio ${JSON.stringify(e)}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong with uploading. Please try again!',
      });
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to upload xlsx' })
  @Post('/xlsx')
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'xlsx',
      path: '/xlsx',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('sheet')) {
          return callback(
            new BadRequestException('Provide a valid xlsx file'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async postXLSX(@UploadedFiles() files, @Response() res) {
    try {
      const file = files?.xlsx[0] || null;
      if (!file) throw new Error('File not found');
      const key = await this.uploadService.upload(
        file.buffer,
        file.originalname,
        'xlsx',
      );
      return res.status(HttpStatus.OK).json({ results: key });
    } catch (e) {
      this.logger.error(`ERROR in POST /upload/xlsx ${JSON.stringify(e)}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong with uploading. Please try again!',
      });
    }
  }
}
