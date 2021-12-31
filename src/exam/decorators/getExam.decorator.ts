import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getExam = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { exam } = request;
    console.log("exam --- ", exam);
    if (exam) return exam;
    return null;
  },
);
