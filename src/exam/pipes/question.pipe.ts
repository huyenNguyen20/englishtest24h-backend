import { PipeTransform, BadRequestException } from '@nestjs/common';

export class QuestionValidationPipe implements PipeTransform {
  transform(value: any) {
    const { order, score, position } = value;
    if (position)
      return {
        ...value,
        score: parseInt(score, 10),
        order: parseInt(order, 10),
        position: parseInt(position, 10),
      };
    else
      return {
        ...value,
        score: parseInt(score, 10),
        order: parseInt(order, 10),
      };
  }
}
