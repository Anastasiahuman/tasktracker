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
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { parseRAQuery, RAListParams } from '../common/utils/ra-list.util';

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

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @Query() query: any,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const params = parseRAQuery(query);
    const result = await this.projectsService.findAll(user.id, params);

    res.setHeader('Content-Range', result.contentRange);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    return res.json(result.data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.findOne(id, user.id);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.create(user.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.update(id, user.id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.remove(id, user.id);
  }
}

