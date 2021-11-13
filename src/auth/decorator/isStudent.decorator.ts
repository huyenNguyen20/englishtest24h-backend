import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const isStudent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return !(request.user.isAdmin || request.user.isEducator);
  },
);
