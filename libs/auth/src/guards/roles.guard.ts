import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
		if (!requiredRoles) {
			return true; // If no roles are required, grant access
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.realm_access?.roles) {
			throw new ForbiddenException("User roles not found");
		}

		const userRoles = user.realm_access.roles;
		const hasRole = requiredRoles.some((role) => userRoles.includes(role));

		if (!hasRole) {
			throw new ForbiddenException("Insufficient role permissions");
		}

		return true;
	}
}
