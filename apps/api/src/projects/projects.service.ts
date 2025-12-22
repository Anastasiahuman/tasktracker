import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { parseRAQuery, buildPrismaQuery, buildContentRange } from '../common/utils/ra-list.util';

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
    const query = buildPrismaQuery(queryParams, []);
    query.where = {
      ...query.where,
      workspaceId,
      archivedAt: null,
    };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany(query),
      this.prisma.project.count({ where: query.where }),
    ]);
    const start = queryParams.range?.start ?? 0;
    const end = start + data.length - 1;
    const contentRange = buildContentRange(start, end, total, 'projects');
    return { data, total, contentRange };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.checkWorkspaceAccess(userId, project.workspaceId);
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    await this.checkWorkspaceAccess(userId, dto.workspaceId);
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
    await this.activitiesService.logWorkspaceAction('created', 'Project', project.id, userId, {
      name: project.name,
      key: project.key,
      workspaceId: project.workspaceId,
    });
    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id, userId);
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
    await this.activitiesService.logWorkspaceAction('updated', 'Project', updated.id, userId, {
      name: updated.name,
      key: updated.key,
    });
    return updated;
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    const archived = await this.prisma.project.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
    await this.activitiesService.logWorkspaceAction('archived', 'Project', archived.id, userId, {
      name: archived.name,
    });
    return archived;
  }
}


