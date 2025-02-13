import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { Keyv } from "keyv";
import { CacheableMemory } from "cacheable";
import { AuthModule } from "@libs/auth/auth.module";
import { PublicModule } from "./public/public.module";
import { SecureModule } from "./secure/secure.module";
import { LoggerMiddleware } from "./logging/logger.middleware";

/*
const cacheMod = CacheModule.registerAsync({
	isGlobal: true,
	useFactory: async () => {
		return {
			stores: [
				new Keyv({
					store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
				}),
				createKeyv("redis://localhost:6379"),
			],
		};
	},
});

const bullMod = BullModule.forRoot({
	redis: {
		host: "localhost",
		port: 6379,
	},
});
*/

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, PublicModule, SecureModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes("*");
	}
}
