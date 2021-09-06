import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionGroupDto } from './create-questionGroup.dto';

export class UpdateQuestionGroupDto extends PartialType(
  CreateQuestionGroupDto,
) {}
