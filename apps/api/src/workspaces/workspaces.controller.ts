import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { WorkspaceRoleGuard } from '../common/guards/workspace-role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, MembershipRole } from '@prisma/client';

class CreateWorkspaceDto {
  name: string;
  description?: string;
  slug?: string;
}

class AddMemberDto {
  email: string;
  role?: MembershipRole;
}

class UpdateMemberRoleDto {
  role: MembershipRole;
}

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  async createWorkspace(
    @CurrentUser() user: User,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(user.id, dto);
  }

  @Get()
  async getMyWorkspaces(@CurrentUser() user: User) {
    return this.workspacesService.getUserWorkspaces(user.id);
  }

  @Post(':id/members')
  @UseGuards(WorkspaceRoleGuard)
  async addMember(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: AddMemberDto,
  ) {
    return this.workspacesService.addMember(workspaceId, user.id, dto);
  }

  @Patch(':id/members/:memberId')
  @UseGuards(WorkspaceRoleGuard)
  async updateMemberRole(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(
      workspaceId,
      memberId,
      user.id,
      dto,
    );
  }

  @Get(':id/members')
  @UseGuards(WorkspaceRoleGuard)
  async getWorkspaceMembers(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.getWorkspaceMembers(workspaceId, user.id);
  }
}

