import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(@Body() { username, password }: { username: string; password: string }) {
		return this.authService.login(username, password);
	}

	@UseGuards(AuthGuard)
	@Post("validate")
	validateToken(@Req() req) {
		return { user: req.user };
	}

	@Post("refresh")
	async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
		return this.authService.refreshToken(refreshToken);
	}

	// 🔹 Logout
	@UseGuards(AuthGuard)
	@Post("logout")
	async logout(@Req() req) {
		return this.authService.logout(req.user);
	}
}
