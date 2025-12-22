import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.id || request.body.workspaceId || request.query.workspaceId;

    if (!workspaceId) {
      throw new ForbiddenException('Workspace ID is required');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    request.membership = membership;
    return true;
  }
}

export function RequireRole(...roles: MembershipRole[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const request = args.find((arg) => arg && arg.membership);
      if (!request || !request.membership) {
        throw new ForbiddenException('Membership not found');
      }
      if (!roles.includes(request.membership.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}


