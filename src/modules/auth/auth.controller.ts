import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthenticatedGuard } from "#_guards/authenticated.guard";
// biome-ignore lint/style/useImportType: This rule is not yet supported by the Biome CLI
import { KeycloakService } from "./keycloak.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly keycloakService: KeycloakService) {}

	/**
	 * Endpoint to trigger Keycloak sign‑in.
	 * A GET request to /auth/login will redirect the user to Keycloak’s login page.
	 */
	@Get("login")
	login(@Req() req: Request, @Res() res: Response) {
		this.keycloakService.login(req, res);
	}

	/**
	 * Endpoint to trigger Keycloak sign‑out.
	 * A GET request to /auth/logout will log the user out.
	 */
	@Get("logout")
	@UseGuards(AuthenticatedGuard)
	logout(@Req() req: Request, @Res() res: Response) {
		this.keycloakService.logout(req, res);
	}
}
