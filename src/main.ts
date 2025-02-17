import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
// README: Replace with @fastify/csrf-protection if you're using Fastify
// import { doubleCsrf, DoubleCsrfConfigOptions } from "csrf-csrf";
// README: Replace with @fastify/helmet if you're using Fastify
import helmet from "helmet";

/*
const doubleCsrfOptions: DoubleCsrfConfigOptions = {
	getSecret: () => process.env.CSRF_SECRET!,
};
*/

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["error", "warn", "log", "debug", "verbose"],
	});

	/*const {
		// TODO: Create middleware with Invalid Token Error
		invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
		// TODO: Create middleware with CSRF Token Generation
		generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
		// TODO: Create middleware with CSRF Token Validation
		validateRequest, // Also a convenience if you plan on making your own middleware.
		doubleCsrfProtection, // This is the default CSRF protection middleware.
	} = doubleCsrf(doubleCsrfOptions);
*/

	app.useGlobalPipes(new ValidationPipe());
	app.use(helmet());

	//app.use(doubleCsrfProtection);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
