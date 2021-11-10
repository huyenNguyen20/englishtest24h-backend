import { PartialType } from '@nestjs/mapped-types';
import { CreateWritingSectionDto } from './create-writing-section.dto';

export class UpdateWritingSectionDto extends PartialType(
  CreateWritingSectionDto,
) {}
