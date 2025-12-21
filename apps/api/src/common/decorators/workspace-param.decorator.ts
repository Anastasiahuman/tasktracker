import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WorkspaceParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspaceId || request.params.id;
  },
);

