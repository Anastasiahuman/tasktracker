import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MembershipRole } from '@prisma/client';

class CreateInvitationDto {
  email: string;
  role: MembershipRole;
}

@Controller('invitations')
@UseGuards(AuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('workspaces/:workspaceId')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: any,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return this.invitationsService.createInvitation(
      workspaceId,
      dto.email,
      dto.role,
      user.id,
      frontendUrl,
    );
  }

  @Get('workspaces/:workspaceId')
  list(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.listInvitations(workspaceId, user.id);
  }

  @Get('token/:token')
  getByToken(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }

  @Post('accept/:token')
  accept(
    @Param('token') token: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.acceptInvitation(token, user.id);
  }

  @Delete(':id')
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.cancelInvitation(id, user.id);
  }
}


