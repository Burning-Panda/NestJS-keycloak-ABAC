import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "#_modules/users/users.module";
import { AuthModule } from "#_modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
	imports: [
		ConfigModule.forRoot(),
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: async () => {
			  return {
				stores: [
				  new Keyv({
					store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
				  }),
				  createKeyv('redis://localhost:6379'),
				],
			  };
			},
		  }),
		BullModule.forRoot({
			redis: {
			  host: 'localhost',
			  port: 6379,
			},
		  }),
		AuthModule, UsersModule],
	controllers: [AppController],
	providers: [ {
		provide: APP_INTERCEPTOR,
		useClass: CacheInterceptor,
	  }, AppService],
})
export class AppModule {}
