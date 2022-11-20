import { Injectable, InternalServerErrorException } from '@nestjs/common';

require('dotenv').config();
@Injectable()
export class UploadService {
  async compressAndUploadImage(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    try {
      const { promisify } = require('util');
      const fs = require('fs');

      const readFileAsync = promisify(fs.readFile);

      const tempFile = './examFiles/image'

      await this.compressImage(buffer, tempFile)
      const compressedImage = await readFileAsync(tempFile);

      // Upload Image
      return await this.upload(compressedImage, fileName, 'image');
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    uploadType: 'image' | 'audio' | 'xlsx',
  ): Promise<string> {
    try {
      // Require neccessary library
      const AWS = require('aws-sdk');
      const { v4 } = require('uuid');

      // Configure AWS Client
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION_S3,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3,
      });

      // Upload the new file to S3
      const newParams = {
        Bucket: this.getDestinationBucket(uploadType),
        Key: `${v4()}-${fileName}`,
        Body: buffer,
      };
      const results = await s3.upload(newParams).promise();
      return results.Location;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  getDestinationBucket(uploadType: 'image' | 'audio' | 'xlsx') {
    let destinationBucket = '';
    switch (uploadType) {
      case 'image':
        destinationBucket = process.env.IMAGE_S3_BUCKET;
        break;
      case 'audio':
        destinationBucket = process.env.IMAGE_S3_BUCKET;
        break;
      case 'xlsx':
        destinationBucket = process.env.IMAGE_S3_BUCKET;
        break;
      default:
        break;
    }
    return destinationBucket;
  }

  compressImage(buffer: Buffer, tempFile: string){
    const Jimp = require('jimp');
    return new Promise((resolve, reject) => {
      // Compress Image
      Jimp.read(buffer)
        .then((result) => {
          result
            .resize(600, 500) // resize
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(tempFile)
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        });
    })
  }
}
