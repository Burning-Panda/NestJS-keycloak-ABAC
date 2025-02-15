import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "./entities/job.entity";
import { JobStatus } from "./job-status.enum";
import * as cronParser from "cron-parser";

@Injectable()
export class JobsService {
	constructor(
		@InjectRepository(Job)
		private readonly jobRepository: Repository<Job>,
	) {}

	/**
	 * Creates a new job.
	 * @param cron - A valid cron expression.
	 * @param data - Optional JSON data for the job.
	 */
	async createJob(cron: string, data?: any): Promise<Job> {
		// Compute the next run based on the cron expression
		const interval = cronParser.CronExpressionParser.parse(cron);
		const nextRun = interval.next().toDate();

		const job = this.jobRepository.create({
			cron,
			data,
			nextRun,
			status: JobStatus.PENDING,
		});
		return await this.jobRepository.save(job);
	}

	/**
	 * Updates the status (and possibly error message) of a job.
	 */
	async updateJobStatus(jobId: string, status: JobStatus, error?: string): Promise<Job> {
		const job = await this.jobRepository.findOne({ where: { id: jobId } });
		if (!job) {
			throw new Error("Job not found");
		}
		job.status = status;
		if (error) {
			job.error = error;
		}
		if (status === JobStatus.COMPLETED || status === JobStatus.ERROR) {
			job.lastRun = new Date();
			// Recalculate the next run time
			const interval = cronParser.CronExpressionParser.parse(job.cron, { currentDate: new Date() });
			job.nextRun = interval.next().toDate();
		}
		return await this.jobRepository.save(job);
	}

	/**
	 * Returns jobs that are due to run.
	 */
	async getDueJobs(): Promise<Job[]> {
		const now = new Date();
		return await this.jobRepository
			.createQueryBuilder("job")
			.where("job.nextRun <= :now", { now })
			.andWhere("job.status IN (:...statuses)", { statuses: [JobStatus.PENDING, JobStatus.ERROR] })
			.getMany();
	}
}
