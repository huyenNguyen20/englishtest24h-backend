import { PipeTransform } from '@nestjs/common';

export class FilterValidationPipe implements PipeTransform {
  transform(value: any) {
    const { limit, offset } = value;
    const result = {};
    if (limit) result['limit'] = parseInt(limit, 10);
    if (offset) result['offset'] = parseInt(offset, 10);
    return { ...value, ...result };
  }
}
