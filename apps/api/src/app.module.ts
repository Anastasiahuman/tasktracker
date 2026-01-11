import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivitiesModule } from './activities/activities.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    ActivitiesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}





