// jobs.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { Job } from "./entities/job.entity";
import { JobsService } from "./jobs.service";
import { SchedulerService } from "./scheduler.service";
import { JobWorker } from "./job.worker";

@Module({
	imports: [TypeOrmModule.forFeature([Job]), ScheduleModule.forRoot()],
	providers: [JobsService, SchedulerService, JobWorker],
	exports: [JobsService],
})
export class JobsModule {}
