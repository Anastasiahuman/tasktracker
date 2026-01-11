import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskCategory, TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, reporterId: string, data: {
    projectId?: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: Date;
    startDate?: Date;
    estimateMinutes?: number;
    assigneeId?: string;
  }) {
    return this.prisma.task.create({
      data: {
        workspaceId,
        reporterId,
        ...data,
      },
      include: {
        assignee: {
          select: { id: true, email: true, name: true },
        },
        reporter: {
          select: { id: true, email: true, name: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.task.findMany({
      where: {
        workspaceId,
        archivedAt: null,
      },
      include: {
        assignee: {
          select: { id: true, email: true, name: true },
        },
        reporter: {
          select: { id: true, email: true, name: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, workspaceId },
      include: {
        assignee: {
          select: { id: true, email: true, name: true },
        },
        reporter: {
          select: { id: true, email: true, name: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, workspaceId: string, userId: string, data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: Date;
    startDate?: Date;
    estimateMinutes?: number;
    assigneeId?: string;
  }) {
    const task = await this.prisma.task.findFirst({
      where: { id, workspaceId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: { id: true, email: true, name: true },
        },
        reporter: {
          select: { id: true, email: true, name: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    });
  }

  async delete(id: string, workspaceId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, workspaceId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }
}





