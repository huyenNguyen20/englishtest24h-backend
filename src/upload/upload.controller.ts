import { Controller, HttpStatus, Inject, Post, Response, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UploadService } from './upload.service';


require('dotenv').config();

@ApiTags('Upload Endpoints')
@Controller('/upload')
@UseGuards()
@UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
]))
export class UploadController {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) 
        private readonly logger: Logger,
    
        private readonly uploadService: UploadService,
      ) {}
    
    @ApiOperation({ summary: 'Method for EXAM OWNER to upload image' })
    @Post('/image')
    async postImage(
        @UploadedFiles() files,
        @Response() res,
    ){
        try{
            this.logger.info(files.image[0]);
            if(!files || !files.image || !files.image[0]) 
                return res.status(HttpStatus.BAD_REQUEST).json({message: 'File must not be empty'});
            if (files.image[0] && 
                !files.image[0].originalname.toLowerCase().match(/\.(jpg|jpeg|gif|png)/)
            ) return res.status(HttpStatus.BAD_REQUEST).json({message: 'Must be An JPG/JPEG/GIF/PNG file'});
            let fileName = files.image[0].filename;
            let tempFile = `public/examsFiles/${fileName}`;
            const imageUrl = await this.uploadService.compressAndUploadImage(tempFile, fileName);
            return res.status(HttpStatus.OK).json({imageUrl});
        } catch (e) {
            this.logger.error(`ERROR in POST /upload/image ${JSON.stringify(e)}`);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong with uploading. Please try again!"
            })
        }
    }
    
    @ApiOperation({ summary: 'Method for EXAM OWNER to upload audio' })
    @Post('/audio')
    async postAudio(
        @UploadedFiles() files,
        @Response() res,
    ){
        try{
            this.logger.info(files.audio[0]);
            if(!files || !files.audio || !files.audio[0]) 
                return res.status(HttpStatus.BAD_REQUEST).json({message: 'File must be empty'});
            if (files.audio[0] && 
                !files.audio[0].originalname.toLowerCase().match(/\.(wav|mp3|ogg)/)
            ) return res.status(HttpStatus.BAD_REQUEST).json({message: 'Must be An MP3/WAV file'});
            let fileName = files.audio[0].filename;
            let tempFile = `public/examsFiles/${fileName}`;
            const audioUrl = await this.uploadService.uploadAudio(tempFile, fileName);
            return res.status(HttpStatus.OK).json({audioUrl});
        } catch (e) {
            this.logger.error(`ERROR in POST /upload/audio ${JSON.stringify(e)}`);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong with uploading. Please try again!"
            })
        }
    }
}
