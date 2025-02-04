// abac.guard.ts
import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	ForbiddenException,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import {
	RESOURCE_KEY,
	ACTION_KEY,
	ATTRIBUTES_KEY,
} from "#_decorators/abac.decorator";

@Injectable()
export class ABACGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		// Get the incoming HTTP request.
		const request = context.switchToHttp().getRequest();

		// Retrieve the Keycloak access token (attached by keycloak-connect middleware).
		const token = request.kauth?.grant?.access_token;
		if (!token) {
			throw new ForbiddenException("No access token found.");
		}

		// The token content is typically where custom claims reside.
		// Adjust according to your Keycloak configuration.
		const tokenContent = token.content;

		// Retrieve the ABAC metadata set on the route handler.
		const resource = this.reflector.get<string>(
			RESOURCE_KEY,
			context.getHandler(),
		);
		const action = this.reflector.get<string>(ACTION_KEY, context.getHandler());
		const attributes = this.reflector.get<string[]>(
			ATTRIBUTES_KEY,
			context.getHandler(),
		);

		// --- Begin ABAC policy evaluation ---
		// (The following is example logic; you should adapt it to your token structure.)

		if (resource) {
			// Suppose your token contains an array of allowed resources under 'allowedResources'.
			const allowedResources: string[] = tokenContent.allowedResources || [];
			if (!allowedResources.includes(resource)) {
				throw new ForbiddenException(
					`Access to resource '${resource}' is denied.`,
				);
			}
		}

		if (action) {
			// Suppose your token contains an array of allowed actions under 'allowedActions'.
			const allowedActions: string[] = tokenContent.allowedActions || [];
			if (!allowedActions.includes(action)) {
				throw new ForbiddenException(`Action '${action}' is not permitted.`);
			}
		}

		if (attributes && attributes.length > 0) {
			// Suppose your token has a map of custom attributes.
			const tokenAttributes = tokenContent.attributes || {};
			for (const attr of attributes) {
				if (!tokenAttributes[attr]) {
					throw new ForbiddenException(`Missing required attribute '${attr}'.`);
				}
			}
		}
		// --- End ABAC policy evaluation ---

		// If all checks pass, allow the request.
		return true;
	}
}
