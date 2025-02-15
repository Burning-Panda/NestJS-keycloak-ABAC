import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { JobStatus } from "../job-status.enum";

const isPostgres = process.env.DB_TYPE === "postgres";
const jsonColumnType = isPostgres ? "jsonb" : "simple-json";

@Entity({ name: "jobs" })
export class Job {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	// A string representing the job type.
	@Column({ type: "varchar", length: 100 })
	jobType: string;

	// The cron string (e.g. '*/5 * * * *')
	@Column({ type: "varchar", length: 255 })
	cron: string;

	@Column({ type: "timestamp", nullable: true })
	lastRun: Date;

	@Column({ type: "timestamp", nullable: true })
	nextRun: Date;

	@Column({ type: "enum", enum: JobStatus, default: JobStatus.PENDING })
	status: JobStatus;

	// Use jsonb for PostgreSQL and simple-json for SQLite
	@Column({ type: jsonColumnType, nullable: true })
	data: any;

	@Column({ type: "text", nullable: true })
	error: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
