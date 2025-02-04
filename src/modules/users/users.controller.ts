import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthenticatedGuard } from "../../guards/authenticated.guard";

@Controller("user")
export class UsersController {
	/**
	 * GET /user/me
	 * Returns the user information extracted from the Keycloak token.
	 */
	@Get("me")
	@UseGuards(AuthenticatedGuard)
	getProfile(@Req() req: Request) {
		// Keycloak-connect attaches the grant to req.kauth.
		// Typically, user information such as username, email, and roles are stored in the id_token's content.

		const userInfo = req.kauth?.grant?.id_token;
		return userInfo;
	}
}
