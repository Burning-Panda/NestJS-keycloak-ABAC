import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedException("Missing or invalid Authorization header");
		}

		const token = authHeader.split(" ")[1];

		try {
			const payload = await this.authService.validateToken(token);

			request.user = payload; // Attach user info to the request
			return true;
		} catch (error) {
			throw new UnauthorizedException("Invalid or expired token");
		}
	}
}
