import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ExtractToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    return authorization.split(' ')[1] ?? null;
  },
);
