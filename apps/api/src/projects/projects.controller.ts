import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { WorkspaceParam } from '../common/decorators/workspace-param.decorator';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@WorkspaceParam('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(
    @WorkspaceParam('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.findOne(id, workspaceId);
  }
}





