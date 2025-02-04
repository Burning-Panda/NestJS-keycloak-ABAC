import {
	Module,
	type NestModule,
	type MiddlewareConsumer,
	RequestMethod,
	Inject,
} from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { KeycloakService } from "./keycloak.service";
import { AuthenticatedGuard } from "#_guards/authenticated.guard";

@Module({
	controllers: [AuthController],
	providers: [KeycloakService, AuthenticatedGuard],
	// Optionally, export providers if other modules need them.
	exports: [KeycloakService, AuthenticatedGuard],
})
export class AuthModule implements NestModule {
	constructor(private readonly keycloakService: KeycloakService) {}

	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(...this.keycloakService.middleware())
			.exclude({
				path: "auth/login",
				method: RequestMethod.GET,
			})
			.forRoutes("*");
	}
}
