import { PipeTransform } from '@nestjs/common';

export class TestEnrollmentValidationPipe implements PipeTransform {
  transform(value: any) {
    const { score } = value;
    return { ...value, score: parseInt(score, 10) };
  }
}
