import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
	@Get()
	getHello(user: any): string {
		if (user) {
			return `Hello ${user.preferred_username}`;
		}
		return "Hello world!";
	}

	@Get("private")
	getPrivate() {
		return "Authenticated only!";
	}

	@Get("admin")
	adminRole() {
		return "Admin only!";
	}
}
