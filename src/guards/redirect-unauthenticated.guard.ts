import {
	Injectable,
	type CanActivate,
	type ExecutionContext,
} from "@nestjs/common";
import type { Observable } from "rxjs";

@Injectable()
export class RedirectUnauthenticatedGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		// Check if the user is authenticated (i.e. Keycloak has attached a grant to the request)
		if (request.kauth?.grant) {
			return true;
		}

		// If not authenticated, build the redirect URL.
		// Optionally, pass the originally requested URL as a query parameter.
		const originalUrl = request.originalUrl || "/";
		response.redirect(
			`/auth/login?redirect=${encodeURIComponent(originalUrl)}`,
		);
		return false;
	}
}
