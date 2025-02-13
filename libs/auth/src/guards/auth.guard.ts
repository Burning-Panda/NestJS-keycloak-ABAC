import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		console.log(request.headers);

		// Supports tokens starting with either "Bearer " or "Token "
		const prefixes = ["Bearer ", "Token "];
		if (!authHeader || !prefixes.some((prefix) => authHeader.startsWith(prefix))) {
			throw new UnauthorizedException("Missing or invalid Authorization header");
		}

		const prefixUsed = prefixes.find((prefix) => authHeader.startsWith(prefix))!;
		const token = authHeader.slice(prefixUsed.length).trim();

		try {
			const payload = await this.authService.validateToken(token);

			request.user = payload; // Attach user info to the request
			return true;
		} catch (error) {
			console.log(error);
			Logger.error(error);
			throw new UnauthorizedException("Invalid or expired token");
		}
	}
}
