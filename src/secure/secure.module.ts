import { Module } from "@nestjs/common";
import { SecureService } from "./secure.service";
import { SecureController } from "./secure.controller";
import { AuthModule } from "#auth/auth.module";

@Module({
	imports: [AuthModule],
	controllers: [SecureController],
	providers: [SecureService],
})
export class SecureModule {}
