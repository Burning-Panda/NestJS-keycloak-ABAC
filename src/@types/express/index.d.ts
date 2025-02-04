import * as express from "express";

declare global {
	namespace Express {
		interface Request {
			kauth?: {
				grant?: {
					id_token?: {
						token: string;
					};
					// Add additional properties from the grant if needed.
				};
				// You can also add other properties if Keycloak attaches more data.
			};
		}
	}
}
