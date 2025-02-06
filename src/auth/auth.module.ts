import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./guards/auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
	providers: [AuthService, AuthGuard, RolesGuard, PermissionsGuard],
	controllers: [AuthController],
	exports: [AuthService, AuthGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
