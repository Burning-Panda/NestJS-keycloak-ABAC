import { ConfigService } from "@nestjs/config";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	constructor(private readonly configService: ConfigService) {}

	use(req: Request, res: Response, next: NextFunction) {
		/* Your Pre existing Middleware code Here */

		interceptAllResponses(res);

		next();
	}
}

const interceptAllResponses = (res: Response) => {
	const originalResponseEndRef = res.end;
	const chunkBuffers: Buffer[] = [];

	res.end = (...chunks: any[]) => {
		/* This is effectively middleware for res.end */
		for (const chunk of chunks) {
			if (chunk) chunkBuffers.push(Buffer.from(chunk));
		}
		const body = Buffer.concat(chunkBuffers).toString("utf8");

		const parsedBody = JSON.parse(body);

		/* Do what you want with your response body */
		console.log(parsedBody);

		originalResponseEndRef.apply(res, chunks);

		return res;
	};
};
