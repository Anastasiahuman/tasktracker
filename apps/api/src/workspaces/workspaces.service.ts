import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { MembershipRole, User } from '@prisma/client';

class CreateWorkspaceDto {
  name: string;
  description?: string;
  slug?: string;
}

class AddMemberDto {
  email: string;
  role?: MembershipRole;
}

class UpdateMemberRoleDto {
  role: MembershipRole;
}

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        memberships: {
          create: {
            userId,
            role: MembershipRole.OWNER,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'CREATE',
      'WORKSPACE',
      workspace.id,
      userId,
      { name: workspace.name, slug: workspace.slug },
    );

    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  async addMember(workspaceId: string, userId: string, dto: AddMemberDto) {
    // Get membership from request (set by WorkspaceRoleGuard)
    // For now, we'll check it again here
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership || ![MembershipRole.OWNER, MembershipRole.ADMIN].includes(membership.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can add members');
    }

    // Find user by email
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUser.id,
          workspaceId,
        },
      },
    });

    if (existingMembership) {
      throw new ForbiddenException('User is already a member');
    }

    const newMembership = await this.prisma.membership.create({
      data: {
        userId: targetUser.id,
        workspaceId,
        role: dto.role || MembershipRole.MEMBER,
      },
      include: {
        user: true,
      },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'ADD_MEMBER',
      'MEMBERSHIP',
      newMembership.id,
      userId,
      {
        workspaceId,
        memberEmail: dto.email,
        role: newMembership.role,
      },
    );

    return newMembership;
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    dto: UpdateMemberRoleDto,
  ) {
    // Check if user is OWNER
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership || membership.role !== MembershipRole.OWNER) {
      throw new ForbiddenException('Only OWNER can change member roles');
    }

    const targetMembership = await this.prisma.membership.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!targetMembership || targetMembership.workspaceId !== workspaceId) {
      throw new NotFoundException('Membership not found');
    }

    const updated = await this.prisma.membership.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: { user: true },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'UPDATE_ROLE',
      'MEMBERSHIP',
      memberId,
      userId,
      {
        workspaceId,
        memberEmail: targetMembership.user.email,
        oldRole: targetMembership.role,
        newRole: dto.role,
      },
    );

    return updated;
  }

  async getWorkspaceMembers(workspaceId: string, userId: string) {
    // Check if user has permission (OWNER or ADMIN)
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership || ![MembershipRole.OWNER, MembershipRole.ADMIN].includes(membership.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can view members');
    }

    return this.prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}

