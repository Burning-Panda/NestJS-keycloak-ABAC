// job.worker.ts
import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Worker, Job as BullJob } from "bullmq";
import { JobsService } from "./jobs.service";
import { JobStatus } from "./job-status.enum";

@Injectable()
export class JobWorker implements OnModuleInit {
	private readonly logger = new Logger(JobWorker.name);
	private worker: Worker;

	constructor(private readonly jobsService: JobsService) {}

	onModuleInit() {
		// Create a BullMQ worker to process jobs from the queue
		this.worker = new Worker(
			"jobQueue",
			async (bullJob: BullJob) => {
				const { jobId, data } = bullJob.data;
				this.logger.log(`Processing job ${jobId}`);

				try {
					// **Insert custom job logic here.**
					// For demonstration, we just log the data.
					this.logger.debug(`Job data: ${JSON.stringify(data)}`);

					// On successful processing, update the job status.
					await this.jobsService.updateJobStatus(jobId, JobStatus.COMPLETED);
				} catch (error) {
					this.logger.error(`Error processing job ${jobId}: ${error.message}`);
					await this.jobsService.updateJobStatus(jobId, JobStatus.ERROR, error.message);
					// Throw error to allow BullMQ to handle retries if configured.
					throw error;
				}
			},
			{
				connection: {
					host: process.env.REDIS_HOST || "localhost",
					port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
				},
			},
		);

		this.worker.on("completed", (job) => {
			this.logger.log(`Job ${job.id} completed.`);
		});

		this.worker.on("failed", (job, err) => {
			this.logger.error(`Job ${job.id} failed: ${err.message}`);
		});
	}
}
