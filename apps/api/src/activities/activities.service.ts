import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async createActivity(data: {
    type: string;
    content?: string;
    taskId?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.activity.create({
      data: {
        type: data.type,
        content: data.content,
        taskId: data.taskId,
        userId: data.userId,
        // Store metadata as JSON string in content if needed
        // For now, we'll use content field
      },
    });
  }

  async logWorkspaceAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    metadata?: Record<string, any>,
  ) {
    const content = metadata ? JSON.stringify(metadata) : undefined;
    return this.createActivity({
      type: `${action}_${entityType}`.toUpperCase(),
      content,
      userId,
    });
  }
}

