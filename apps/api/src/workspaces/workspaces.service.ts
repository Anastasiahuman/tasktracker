import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

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
        _count: {
          select: {
            memberships: true,
            projects: true,
            tasks: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.workspace.findFirst({
      where: {
        id,
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            tasks: true,
          },
        },
      },
    });
  }
}





