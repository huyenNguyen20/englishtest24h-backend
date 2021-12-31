import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getExam = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { exam } = request;
    if (exam) return exam;
    return null;
  },
);
