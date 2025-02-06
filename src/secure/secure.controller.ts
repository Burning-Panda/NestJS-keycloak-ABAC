import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { Roles } from "#auth/decorators/roles.decorator";
import { PermissionsGuard } from "#auth/guards/permissions.guard";
import { AuthGuard } from "#auth/guards/auth.guard";
import { RolesGuard } from "#auth/guards/roles.guard";
import { Permissions } from "#auth/decorators/permissions.decorator";
import { Actions, Resources } from "#auth/enums/permissions.enum";

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
