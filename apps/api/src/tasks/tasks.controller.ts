import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { parseRAQuery } from '../common/utils/ra-list.util';

class CreateTaskDto {
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
  startDate?: Date;
  estimateMinutes?: number;
  assigneeId?: string;
}

class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date | null;
  startDate?: Date | null;
  estimateMinutes?: number | null;
  assigneeId?: string | null;
  projectId?: string | null;
}

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query() query: any,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const params = parseRAQuery(query);
    const result = await this.tasksService.findAll(user.id, params);

    res.setHeader('Content-Range', result.contentRange);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    return res.json(result.data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id, user.id);
  }

  @Post()
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(user.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(id, user.id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user.id);
  }
}

