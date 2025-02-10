import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { Roles } from "@libs/auth/decorators/roles.decorator";
import { PermissionsGuard } from "@libs/auth/guards/permissions.guard";
import { AuthGuard } from "@libs/auth/guards/auth.guard";
import { RolesGuard } from "@libs/auth/guards/roles.guard";
import { Permissions } from "@libs/auth/decorators/permissions.decorator";
import { Actions, Resources } from "@libs/auth/enums/permissions.enum";

@Controller("secure")
export class SecureController {
	@UseGuards(AuthGuard, RolesGuard)
	@Roles("admin")
	@Get("admin")
	getAdminData(@Req() req) {
		return { message: "Admin Data", user: req.user };
	}

	@UseGuards(AuthGuard, PermissionsGuard)
	@Permissions([Actions.READ, Resources.REPORTS])
	@Get("reports")
	getReports(@Req() req) {
		return { message: "User has permission to read reports", user: req.user };
	}

	@UseGuards(AuthGuard, PermissionsGuard)
	@Permissions([Actions.CREATE, Resources.REPORTS])
	@Get("write-article")
	writeArticle(@Req() req) {
		return { message: "User can write articles", user: req.user };
	}
}
