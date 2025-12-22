import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'Task Tracker API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        auth: '/auth',
        workspaces: '/workspaces',
        projects: '/projects',
        tasks: '/tasks',
        activities: '/activities',
      },
    };
  }

  @Get('health')
  getHealth() {
    return { ok: true };
  }
}


