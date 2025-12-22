import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { parseRAQuery, buildPrismaQuery, buildContentRange } from '../common/utils/ra-list.util';
import { TaskStatus, TaskPriority } from '@prisma/client';

class CreateTaskDto {
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimateMinutes?: number;
  assigneeId?: string;
}

class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimateMinutes?: number;
  assigneeId?: string;
  projectId?: string;
}

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async checkWorkspaceAccess(userId: string, workspaceId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
  }

  async findAll(userId: string, params: any) {
    const queryParams = parseRAQuery(params);
    if (!queryParams.filter?.workspaceId) {
      throw new ForbiddenException('workspaceId is required in filter');
    }
    const workspaceId = queryParams.filter.workspaceId;
    await this.checkWorkspaceAccess(userId, workspaceId);

    const query = buildPrismaQuery(queryParams, ['workspaceId', 'projectId', 'status', 'priority', 'assigneeId']);
    
    // Handle search query (q)
    if (queryParams.filter?.q) {
      const searchTerm = queryParams.filter.q;
      query.where = {
        ...query.where,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };
    }

    query.where = {
      ...query.where,
      workspaceId,
      archivedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        ...query,
        include: {
          assignee: true,
          reporter: true,
          project: true,
        },
      }),
      this.prisma.task.count({ where: query.where }),
    ]);

    const start = queryParams.range?.start ?? 0;
    const end = start + data.length - 1;
    const contentRange = buildContentRange(start, end, total, 'tasks');
    return { data, total, contentRange };
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        reporter: true,
        project: true,
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.checkWorkspaceAccess(userId, task.workspaceId);
    return task;
  }

  async create(userId: string, dto: CreateTaskDto) {
    await this.checkWorkspaceAccess(userId, dto.workspaceId);

    if (dto.assigneeId) {
      await this.checkWorkspaceAccess(dto.assigneeId, dto.workspaceId);
    }

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project || project.workspaceId !== dto.workspaceId) {
        throw new NotFoundException('Project not found in workspace');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        ...dto,
        reporterId: userId,
      },
      include: {
        assignee: true,
        reporter: true,
        project: true,
      },
    });

    await this.activitiesService.logWorkspaceAction('created', 'Task', task.id, userId, {
      title: task.title,
      workspaceId: task.workspaceId,
    });

    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id, userId);

    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      await this.checkWorkspaceAccess(dto.assigneeId, task.workspaceId);
    }

    if (dto.projectId && dto.projectId !== task.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project || project.workspaceId !== task.workspaceId) {
        throw new NotFoundException('Project not found in workspace');
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: dto,
      include: {
        assignee: true,
        reporter: true,
        project: true,
      },
    });

    await this.activitiesService.logWorkspaceAction('updated', 'Task', updated.id, userId, {
      title: updated.title,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    const archived = await this.prisma.task.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    await this.activitiesService.logWorkspaceAction('archived', 'Task', archived.id, userId, {
      title: archived.title,
    });

    return archived;
  }
}


