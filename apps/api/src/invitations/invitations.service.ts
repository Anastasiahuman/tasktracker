import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { MembershipRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private workspacesService: WorkspacesService,
  ) {}

  async createInvitation(
    workspaceId: string,
    email: string,
    role: MembershipRole,
    invitedById: string,
    frontendUrl: string,
  ) {
    // Проверка доступа к workspace
    await this.workspacesService.findOne(workspaceId, invitedById);

    // Проверка, что пользователь не уже участник
    const existingMembership = await this.prisma.membership.findFirst({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    // Проверка, что нет активного приглашения
    const existingInvitation = await this.prisma.invitation.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
    });

    if (existingInvitation && !existingInvitation.acceptedAt && existingInvitation.expiresAt > new Date()) {
      throw new BadRequestException('Invitation already sent and not expired');
    }

    // Генерация токена
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    // Создание приглашения
    const invitation = await this.prisma.invitation.upsert({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
      update: {
        token,
        role,
        expiresAt,
        acceptedAt: null,
        invitedById,
      },
      create: {
        workspaceId,
        email,
        role,
        token,
        invitedById,
        expiresAt,
      },
      include: {
        workspace: true,
        inviter: true,
      },
    });

    // Отправка email
    const inviteUrl = `${frontendUrl}/register?token=${token}`;
    await this.emailService.sendInvitation(email, {
      workspaceName: invitation.workspace.name,
      inviterName: invitation.inviter.name || invitation.inviter.email,
      inviteUrl,
      expiresIn: '7 дней',
    });

    return invitation;
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
        inviter: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation expired');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.getInvitationByToken(token);

    // Проверка, что email совпадает
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException('Email does not match invitation');
    }

    // Создание membership
    await this.prisma.membership.create({
      data: {
        userId,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    });

    // Обновление приглашения
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return { success: true, workspaceId: invitation.workspaceId };
  }

  async listInvitations(workspaceId: string, userId: string) {
    await this.workspacesService.findOne(workspaceId, userId);

    return this.prisma.invitation.findMany({
      where: { workspaceId },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.workspacesService.findOne(invitation.workspaceId, userId);

    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { success: true };
  }
}


