import { PartialType } from '@nestjs/swagger';
import { CreateTestEnrollmentDto } from './create-test-enrollment.dto';

export class UpdateTestEnrollmentDto extends PartialType(
  CreateTestEnrollmentDto,
) {}
