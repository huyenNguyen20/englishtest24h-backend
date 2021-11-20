import { InternalServerErrorException } from '@nestjs/common';

export const batchDeleteImage = async (
  fileNameArr: string[],
): Promise<void> => {
  try {
    // Require neccessary library
    const AWS = require('aws-sdk');

    // Configure AWS Client
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const deleteImages = fileNameArr.map(async (fileName) => {
      const params = {
        Bucket: process.env.IMAGE_S3_BUCKET,
        Key: fileName,
      };
      return await s3.deleteObject(params).promise();
    });
    await Promise.all(deleteImages);
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};

export const batchDeleteAudio = async (
  fileNameArr: string[],
): Promise<void> => {
  try {
    // Require neccessary library
    const AWS = require('aws-sdk');

    // Configure AWS Client
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const deleteAudios = fileNameArr.map(async (fileName) => {
      const params = {
        Bucket: process.env.AUDIO_S3_BUCKET,
        Key: fileName,
      };
      return await s3.deleteObject(params).promise();
    });
    await Promise.all(deleteAudios);
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};

export const deleteAudio = async (fileName: string): Promise<void> => {
  try {
    // Require neccessary library
    const AWS = require('aws-sdk');

    // Configure AWS Client
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Bucket: process.env.AUDIO_S3_BUCKET,
      Key: fileName,
    };
    await s3.deleteObject(params).promise();
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};

export const deleteImage = async (fileName: string): Promise<void> => {
  try {
    // Require neccessary library
    const AWS = require('aws-sdk');

    // Configure AWS Client
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Bucket: process.env.IMAGE_S3_BUCKET,
      Key: fileName,
    };
    await s3.deleteObject(params).promise();
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};

export const compressAndUploadImage = async (
  tempFile: string,
  fileName: string,
): Promise<string> => {
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
    // const compressImage = promisify(Jimp.read)
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
};

export const encodeToBase64 = (file: any) =>
  new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const data = fileReader.result;
        if (data && typeof data === 'string') resolve(data.split(',')[1]);
      };
      fileReader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
