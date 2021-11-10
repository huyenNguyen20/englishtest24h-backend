import { PipeTransform, BadRequestException } from '@nestjs/common';

export class CreateWritingSectionValidationPipe implements PipeTransform {
  transform(value: any) {
    const { score, minWords } = value;
    return {
      ...value,
      score: parseInt(score, 10),
      minWords: parseInt(minWords, 10),
    };
  }
}
