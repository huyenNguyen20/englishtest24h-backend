import { PipeTransform } from '@nestjs/common';

export class QuestionGroupValidationPipe implements PipeTransform {
  transform(value: any) {
    const { type } = value;
    return { ...value, type: parseInt(type, 10) };
  }
}
