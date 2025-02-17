import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		// Debug log headers
		Logger.debug("Request headers:", request.headers);

		// Supports tokens starting with either "Bearer " or "Token "
		const prefixes = ["Bearer ", "Token "];
		if (!authHeader || !prefixes.some((prefix) => authHeader.startsWith(prefix))) {
			throw new UnauthorizedException("Missing or invalid Authorization header");
		}

		const prefixUsed = prefixes.find((prefix) => authHeader.startsWith(prefix))!;
		const token = authHeader.slice(prefixUsed.length).trim();

		try {
			const claims = await this.authService.validateToken(token);
			request.user = {
				...claims,
				access_token: token, // Add the token to the user object for later use
			};
			return true;
		} catch (error) {
			Logger.error("Token validation error:", error);
			throw new UnauthorizedException("Invalid or expired token");
		}
	}
}
