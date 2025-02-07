import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.get<string[]>("permissions", context.getHandler());
		if (!requiredPermissions) {
			return true; // If no permissions are required, allow access
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.resource_access || !user.resource_access[process.env.KEYCLOAK_CLIENT_ID!]) {
			throw new ForbiddenException("User permissions not found");
		}

		const userPermissions = user.resource_access[process.env.KEYCLOAK_CLIENT_ID!].roles;
		const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));

		if (!hasPermission) {
			throw new ForbiddenException("Insufficient permissions");
		}

		return true;
	}
}
