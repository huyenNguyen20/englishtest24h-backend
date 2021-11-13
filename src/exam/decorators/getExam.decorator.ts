import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Exam } from '../entities/exam.entity';

export const getExam = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { examId } = request.params;
    if (examId) {
      const exam = await await getConnection()
        .createQueryBuilder()
        .from(Exam, 'e')
        .where('e.id =:examId', { examId })
        .getOne();
      return exam;
    }
    return null;
  },
);
