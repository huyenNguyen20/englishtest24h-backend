import {
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

require('dotenv').config();

@ApiTags('Upload Endpoints')
@Controller('/upload')
@UseGuards()
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
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
  async postImage(@UploadedFiles() files, @Response() res) {
    try {
      // 1. Check if the file exists
      if (!files || !files.image || !files.image[0])
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'File must not be empty' });

      // 2. Check if the file is in the right format
      if (
        files.image[0] &&
        !files.image[0].originalname.toLowerCase().match(/\.(jpg|jpeg|png)/)
      )
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Must be An JPG/JPEG/PNG file' });

      // 3. Upload file
      const fileName = files.image[0].filename;
      const tempFile = `public/examsFiles/${fileName}`;
      const imageUrl = await this.uploadService.compressAndUploadImage(
        tempFile,
        fileName,
      );
      return res.status(HttpStatus.OK).json({ results: imageUrl });
    } catch (e) {
      this.logger.error(`ERROR in POST /upload/image ${JSON.stringify(e)}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong with uploading. Please try again!',
      });
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to upload audio' })
  @Post('/audio')
  async postAudio(@UploadedFiles() files, @Response() res) {
    try {
      // 1. Check if the file exists
      if (!files || !files.audio || !files.audio[0])
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'File must be empty' });

      // 2. Check if the file is in the right format
      if (
        files.audio[0] &&
        !files.audio[0].originalname.toLowerCase().match(/\.(wav|mp3)/)
      )
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Must be An MP3/WAV file' });

      // 3. Upload file
      const fileName = files.audio[0].filename;
      const tempFile = `public/examsFiles/${fileName}`;
      const audioUrl = await this.uploadService.uploadAudio(tempFile, fileName);
      return res.status(HttpStatus.OK).json({ results: audioUrl });
    } catch (e) {
      this.logger.error(`ERROR in POST /upload/audio ${JSON.stringify(e)}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong with uploading. Please try again!',
      });
    }
  }
}
