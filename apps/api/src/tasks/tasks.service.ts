import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import {
  buildPrismaQuery,
  buildContentRange,
  RAListParams,
  RAListResult,
} from '../common/utils/ra-list.util';
import { Task, TaskStatus, TaskPriority, Prisma } from '@prisma/client';

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
  dueDate?: Date | null;
  startDate?: Date | null;
  estimateMinutes?: number | null;
  assigneeId?: string | null;
  projectId?: string | null;
}

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  /**
   * Check if user has access to workspace
   */
  private async checkWorkspaceAccess(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
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

  /**
   * Validate assignee is a member of workspace
   */
  private async validateAssignee(
    assigneeId: string | null | undefined,
    workspaceId: string,
  ): Promise<void> {
    if (!assigneeId) {
      return;
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: assigneeId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('Assignee must be a member of the workspace');
    }
  }

  async findAll(
    userId: string,
    params: RAListParams,
  ): Promise<RAListResult<Task>> {
    // workspaceId is required in filter
    if (!params.filter?.workspaceId) {
      throw new ForbiddenException('workspaceId is required in filter');
    }

    const workspaceId = params.filter.workspaceId;
    await this.checkWorkspaceAccess(userId, workspaceId);

    // Build query with search in title and description
    const query = buildPrismaQuery(params, ['title', 'description']);

    // Add workspaceId and exclude archived
    query.where = {
      ...query.where,
      workspaceId,
      archivedAt: null,
    };

    // Include relations
    const queryWithIncludes = {
      ...query,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany(queryWithIncludes),
      this.prisma.task.count({ where: query.where }),
    ]);

    const start = params.range?.start ?? 0;
    const end = start + data.length - 1;
    const contentRange = buildContentRange(start, end, total, 'tasks');

    return { data, total, contentRange };
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.checkWorkspaceAccess(userId, task.workspaceId);

    return task as any;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    await this.checkWorkspaceAccess(userId, dto.workspaceId);

    // Validate assignee if provided
    await this.validateAssignee(dto.assigneeId, dto.workspaceId);

    // Validate project if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!project || project.workspaceId !== dto.workspaceId) {
        throw new BadRequestException('Project not found or belongs to different workspace');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        ...dto,
        reporterId: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'created',
      'Task',
      task.id,
      userId,
      {
        title: task.title,
        status: task.status,
        workspaceId: task.workspaceId,
      },
    );

    return task as any;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Validate assignee if being updated
    if (dto.assigneeId !== undefined) {
      await this.validateAssignee(dto.assigneeId, task.workspaceId);
    }

    // Validate project if being updated
    if (dto.projectId !== undefined && dto.projectId !== null) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!project || project.workspaceId !== task.workspaceId) {
        throw new BadRequestException('Project not found or belongs to different workspace');
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: dto,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'updated',
      'Task',
      id,
      userId,
      { changes: dto },
    );

    return updated as any;
  }

  async remove(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Soft delete
    const archived = await this.prisma.task.update({
      where: { id },
      data: { archivedAt: new Date() },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'archived',
      'Task',
      id,
      userId,
      { title: task.title },
    );

    return archived as any;
  }
}

