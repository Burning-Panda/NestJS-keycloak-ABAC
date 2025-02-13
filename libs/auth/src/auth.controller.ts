import { Controller, Post, Body, UseGuards, Req, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// Login
	// TODO: This endpoint needs to be able to be disabled
	@Post("login")
	async login(@Body() { username, password }: { username: string; password: string }) {
		return this.authService.login(username, password);
	}

	// Validate Token
	// TODO: This endpoint needs to be connected to a service that can validate the token
	@UseGuards(AuthGuard)
	@Post("validate")
	validateToken(@Req() req) {
		return this.authService.validateToken(req.headers.authorization);
	}

	// Refresh Token
	// TODO: Improve this endpoint
	@Post("refresh")
	async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
		return this.authService.refreshToken(refreshToken);
	}

	// Logout
	// TODO: This endpoint needs to be connected to a service that can logout the user
	@UseGuards(AuthGuard)
	@Post("logout")
	async logout(@Req() req) {
		return this.authService.logout(req.user);
	}

	@UseGuards(AuthGuard)
	@Get("me")
	me(@Req() req): Promise<Object> {
		return this.authService.getMe(req.user);
	}
}
