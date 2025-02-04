import {
	Injectable,
	type CanActivate,
	type ExecutionContext,
	UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest();
		if (req.kauth?.grant) {
			return true;
		}
		throw new UnauthorizedException("User is not authenticated.");
	}
}
