import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.id || request.params.workspaceId;

    if (!user || !workspaceId) {
      throw new ForbiddenException('User or workspace not found');
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

    // Store membership in request for use in controllers
    request.membership = membership;
    request.workspaceId = workspaceId;

    return true;
  }

  // Static method to check if user has required role
  static hasRole(membership: { role: MembershipRole }, requiredRoles: MembershipRole[]): boolean {
    return requiredRoles.includes(membership.role);
  }
}

// Decorator for required roles
export const RequireRoles = (...roles: MembershipRole[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0]?.request || args.find(arg => arg?.membership);
      const membership = request?.membership;

      if (!membership || !roles.includes(membership.role)) {
        throw new ForbiddenException(`Required role: ${roles.join(' or ')}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

