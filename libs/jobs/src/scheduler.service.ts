// scheduler.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JobsService } from "./jobs.service";
import { Job } from "./entities/job.entity";
import { Queue } from "bullmq";
import { JobStatus } from "./job-status.enum";

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name);
	private readonly queue: Queue;

	constructor(private readonly jobsService: JobsService) {
		// Initialize BullMQ queue; configuration comes from environment variables
		this.queue = new Queue("jobQueue", {
			connection: {
				host: process.env.REDIS_HOST || "localhost",
				port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
			},
		});
	}

	// This method is automatically called every minute.
	@Cron(CronExpression.EVERY_MINUTE)
	async pollJobs() {
		this.logger.log("Polling for due jobs...");
		const dueJobs: Job[] = await this.jobsService.getDueJobs();

		for (const job of dueJobs) {
			try {
				// Mark the job as running before dispatching
				await this.jobsService.updateJobStatus(job.id, JobStatus.RUNNING);
				// Enqueue the job for processing
				await this.queue.add(job.id, { jobId: job.id, data: job.data });
				this.logger.log(`Enqueued job ${job.id}`);
			} catch (error) {
				this.logger.error(`Error enqueuing job ${job.id}: ${error.message}`);
				await this.jobsService.updateJobStatus(job.id, JobStatus.ERROR, error.message);
			}
		}
	}
}
