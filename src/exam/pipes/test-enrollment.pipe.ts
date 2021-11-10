import { PipeTransform } from '@nestjs/common';

export class TestEnrollmentValidationPipe implements PipeTransform {
  transform(value: any) {
    const { score, totalScore } = value;
    if (score)
      return {
        ...value,
        score: parseInt(score, 10),
        totalScore: parseInt(totalScore, 10),
      };
    else return { ...value, totalScore: parseInt(totalScore, 10) };
  }
}
