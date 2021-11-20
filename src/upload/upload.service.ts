import { Injectable, InternalServerErrorException } from '@nestjs/common';

require('dotenv').config();
@Injectable()
export class UploadService {
  async compressAndUploadImage(
    tempFile: string,
    fileName: string,
  ): Promise<string> {
    try {
      // Require neccessary library
      const AWS = require('aws-sdk');
      const { promisify } = require('util');
      const fs = require('fs');
      const { v4 } = require('uuid');
      const Jimp = require('jimp');

      // Configure AWS Client
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      // Convert Callback functions to Async/Await functions
      const readFileAsync = promisify(fs.readFile);
      const unlinkAsync = promisify(fs.unlink);

      // Compress Image
      const newFileName = `${fileName}-${v4()}`;
      Jimp.read(tempFile)
        .then((result) => {
          return result
            .resize(600, 500) // resize
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(tempFile); // save
        })
        .catch((err) => {
          throw new Error(err);
        });

      // Read new file
      const compressedImage = await readFileAsync(tempFile);

      // Upload the new file to S3
      const newParams = {
        Bucket: process.env.IMAGE_S3_BUCKET,
        Key: newFileName,
        Body: compressedImage,
        ContentType: 'image/jpeg',
      };
      await s3.putObject(newParams).promise();

      //Remove new file from current directory
      await unlinkAsync(tempFile);

      return process.env.IMAGES_S3_CLOUDFRONT_URL + '/' + newFileName;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async uploadAudio(tempFile: string, fileName: string): Promise<string> {
    try {
      // Require neccessary library
      const AWS = require('aws-sdk');
      const { promisify } = require('util');
      const fs = require('fs');
      const { v4 } = require('uuid');

      // Configure AWS Client
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      // Convert Callback functions to Async/Await functions
      const readFileAsync = promisify(fs.readFile);
      const unlinkAsync = promisify(fs.unlink);

      const newFileName = `${fileName}-${v4()}`;
      // Read new file
      const audioFile = await readFileAsync(tempFile);

      // Upload the new file to S3
      const newParams = {
        Bucket: process.env.AUDIO_S3_BUCKET,
        Key: newFileName,
        Body: audioFile,
        ContentType: 'audio/basic',
      };
      await s3.putObject(newParams).promise();

      //Remove new file from current directory
      await unlinkAsync(tempFile);

      return process.env.AUDIO_S3_BUCKET_URL + '/' + newFileName;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
