import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async create(userId: string, name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const workspace = await this.prisma.workspace.create({
      data: {
        name,
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

    await this.activitiesService.logWorkspaceAction('created', 'Workspace', workspace.id, userId, {
      name: workspace.name,
    });

    return workspace;
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        memberships: {
          some: {
            userId,
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
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const membership = workspace.memberships.find((m) => m.userId === userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
  }

  async addMember(workspaceId: string, userId: string, memberEmail: string, role: MembershipRole) {
    const workspace = await this.findOne(workspaceId, userId);
    const requesterMembership = workspace.memberships.find((m) => m.userId === userId);

    if (requesterMembership?.role !== MembershipRole.OWNER && requesterMembership?.role !== MembershipRole.ADMIN) {
      throw new ForbiddenException('Only owners and admins can add members');
    }

    const member = await this.prisma.user.findUnique({
      where: { email: memberEmail },
    });

    if (!member) {
      throw new NotFoundException('User not found');
    }

    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: member.id,
          workspaceId,
        },
      },
    });

    if (existingMembership) {
      throw new ForbiddenException('User is already a member');
    }

    const membership = await this.prisma.membership.create({
      data: {
        userId: member.id,
        workspaceId,
        role,
      },
      include: {
        user: true,
      },
    });

    await this.activitiesService.logWorkspaceAction('added_member', 'Membership', membership.id, userId, {
      memberEmail,
      role,
    });

    return membership;
  }

  async updateMemberRole(workspaceId: string, userId: string, memberId: string, role: MembershipRole) {
    const workspace = await this.findOne(workspaceId, userId);
    const requesterMembership = workspace.memberships.find((m) => m.userId === userId);

    if (requesterMembership?.role !== MembershipRole.OWNER && requesterMembership?.role !== MembershipRole.ADMIN) {
      throw new ForbiddenException('Only owners and admins can change roles');
    }

    if (memberId === userId && role !== MembershipRole.OWNER) {
      throw new ForbiddenException('Cannot change your own role from owner');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const updated = await this.prisma.membership.update({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
      data: { role },
      include: {
        user: true,
      },
    });

    await this.activitiesService.logWorkspaceAction('updated_role', 'Membership', updated.id, userId, {
      memberId,
      role,
    });

    return updated;
  }

  async getMembers(workspaceId: string, userId: string) {
    await this.findOne(workspaceId, userId);
    return this.prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: true,
      },
    });
  }
}

