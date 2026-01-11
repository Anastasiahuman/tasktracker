import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
        archivedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    return this.prisma.project.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }
}





