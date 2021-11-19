import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
    imports: [
        AuthModule,
        MulterModule.register({
          dest: 'public/examsFiles',
          fileFilter: (req, file, cb) => {
            if (
              !file.originalname
                .toLowerCase()
                .match(/\.(jpg|jpeg|png|wav|mp3)$/)
            ) {
              // You can always pass an error if something goes wrong:l);
              cb(new Error('You can only upload image / audio files'), null);
            }
            // To accept the file pass `true`, like so:
            cb(null, true);
          },
        }),
      ],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService]
})
export class UploadModule {}
