import { PipeTransform } from '@nestjs/common';

export class CreateQuestionGroupValidationPipe implements PipeTransform {
  transform(value: any) {
    const { type, questions } = value;
    return {
      ...value,
      type: parseInt(type, 10),
      questions: JSON.parse(questions),
    };
  }
}
