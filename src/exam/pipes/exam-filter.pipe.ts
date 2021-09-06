import { PipeTransform } from '@nestjs/common';

export class ExamFilterValidationPipe implements PipeTransform {
  transform(value: any) {
    const { limit, offset, subject } = value;
    const result = {};
    if (limit) result['limit'] = parseInt(limit, 10);
    if (offset) result['offset'] = parseInt(offset, 10);
    if (subject === 0 || subject) result['subject'] = parseInt(subject, 10);
    return { ...value, ...result };
  }
}
