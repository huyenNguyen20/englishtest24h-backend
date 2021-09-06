import { PipeTransform } from '@nestjs/common';

export class ExamValidationPipe implements PipeTransform {
  transform(value: any) {
    const { timeAllowed, subject } = value;
    return {
      ...value,
      timeAllowed: parseInt(timeAllowed, 10),
      subject: parseInt(subject, 10),
    };
  }
}
