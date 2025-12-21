import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import {
  buildPrismaQuery,
  buildContentRange,
  RAListParams,
  RAListResult,
} from '../common/utils/ra-list.util';
import { Project, Prisma } from '@prisma/client';

class CreateProjectDto {
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
}

class UpdateProjectDto {
  name?: string;
  key?: string;
  description?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  /**
   * Check if user has access to workspace
   * We use service-level check instead of guard for flexibility
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

  async findAll(
    userId: string,
    params: RAListParams,
  ): Promise<RAListResult<Project>> {
    // workspaceId is required in filter
    if (!params.filter?.workspaceId) {
      throw new ForbiddenException('workspaceId is required in filter');
    }

    const workspaceId = params.filter.workspaceId;
    await this.checkWorkspaceAccess(userId, workspaceId);

    // Build query
    const query = buildPrismaQuery(params, []);
    
    // Add workspaceId and exclude archived
    query.where = {
      ...query.where,
      workspaceId,
      archivedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany(query),
      this.prisma.project.count({ where: query.where }),
    ]);

    const start = params.range?.start ?? 0;
    const end = start + data.length - 1;
    const contentRange = buildContentRange(start, end, total, 'projects');

    return { data, total, contentRange };
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.checkWorkspaceAccess(userId, project.workspaceId);

    return project;
  }

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    await this.checkWorkspaceAccess(userId, dto.workspaceId);

    // Check if key is unique in workspace
    const existing = await this.prisma.project.findUnique({
      where: {
        workspaceId_key: {
          workspaceId: dto.workspaceId,
          key: dto.key,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('Project key already exists in workspace');
    }

    const project = await this.prisma.project.create({
      data: dto,
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'created',
      'Project',
      project.id,
      userId,
      { name: project.name, key: project.key, workspaceId: project.workspaceId },
    );

    return project;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    // Check key uniqueness if key is being updated
    if (dto.key && dto.key !== project.key) {
      const existing = await this.prisma.project.findUnique({
        where: {
          workspaceId_key: {
            workspaceId: project.workspaceId,
            key: dto.key,
          },
        },
      });

      if (existing) {
        throw new ForbiddenException('Project key already exists in workspace');
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: dto,
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'updated',
      'Project',
      id,
      userId,
      { changes: dto },
    );

    return updated;
  }

  async remove(id: string, userId: string): Promise<Project> {
    const project = await this.findOne(id, userId);

    // Soft delete
    const archived = await this.prisma.project.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    // Audit log
    await this.activitiesService.logWorkspaceAction(
      'archived',
      'Project',
      id,
      userId,
      { name: project.name },
    );

    return archived;
  }
}

