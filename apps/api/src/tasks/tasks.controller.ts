import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceParam } from '../common/decorators/workspace-param.decorator';
import { TaskStatus, TaskPriority, TaskCategory } from '@prisma/client';

class CreateTaskDto {
  projectId?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  startDate?: string;
  estimateMinutes?: number;
  assigneeId?: string;
}

class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  startDate?: string;
  estimateMinutes?: number;
  assigneeId?: string;
}

@Controller('workspaces/:workspaceId/tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @WorkspaceParam('workspaceId') workspaceId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(workspaceId, user.id, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    });
  }

  @Get()
  async findAll(@WorkspaceParam('workspaceId') workspaceId: string) {
    return this.tasksService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(
    @WorkspaceParam('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.findOne(id, workspaceId);
  }

  @Patch(':id')
  async update(
    @WorkspaceParam('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, workspaceId, user.id, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    });
  }

  @Delete(':id')
  async remove(
    @WorkspaceParam('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.delete(id, workspaceId, user.id);
  }
}





