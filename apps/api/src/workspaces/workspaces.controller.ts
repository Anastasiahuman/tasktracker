import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.workspacesService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.findOne(id, user.id);
  }
}





