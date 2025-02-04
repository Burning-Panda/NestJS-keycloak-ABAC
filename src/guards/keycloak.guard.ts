import { KeycloakService } from "#_modules/auth/keycloak.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private readonly keycloak: KeycloakService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return true
  }
}