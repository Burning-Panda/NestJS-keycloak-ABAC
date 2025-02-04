import { Inject, Injectable } from "@nestjs/common";
import * as session from "express-session";
import * as KeycloakConnect from "keycloak-connect";
import type { Request, Response, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class KeycloakService {
	private keycloak: KeycloakConnect.Keycloak;

	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
		const keycloakConfig: KeycloakConnect.KeycloakConfig = {
			realm: process.env.KEYCLOAK_REALM || "master",
			"auth-server-url":
				process.env.KEYCLOAK_AUTH_SERVER_URL || "http://localhost:8080/auth",
			"ssl-required": process.env.KEYCLOAK_SSL_REQUIRED || "external",
			resource: process.env.KEYCLOAK_RESOURCE || "myclient",
			"confidential-port": process.env.KEYCLOAK_CONFIDENTIAL_PORT || 0,
			// "bearer-only": false,
		};

		// Instantiate the Keycloak adapter
		this.keycloak = new KeycloakConnect({ store: this.cacheManager }, keycloakConfig);
	}


	/**
	 * Returns the Keycloak middleware.
	 */
	middleware(): RequestHandler[] {
		return this.keycloak.middleware();
	}

	/**
	 * Initiates the login flow.
	 *
	 * If the user is already signed in (i.e. a Keycloak token exists in the session),
	 * the user is immediately redirected to a success URL.
	 *
	 * Query Parameters:
	 *  - redirect: The URL to return to after login (if not already signed in).
	 *  - success:  The URL to redirect to immediately if the user is already signed in.
	 */
	login(req: Request, res: Response): void {
		// Use the 'redirect' query parameter or default to '/'
		const redirectUrl = req.query.redirect
			? req.query.redirect.toString()
			: "/";

		// Check if the user is already signed in by verifying the existence of a Keycloak token in the session.
		// The Keycloak adapter typically stores the token in req.session['keycloak-token']
		if (req.session?.["keycloak-token"]) {
			// Use the 'success' query parameter if provided, otherwise fallback to redirectUrl.
			const successRedirect = req.query.success
				? req.query.success.toString()
				: redirectUrl;
			res.redirect(successRedirect);
			return;
		}

		// If not signed in, generate a new login URL and redirect the client.
		const uuid = uuidv4();
		const url = this.keycloak.loginUrl(uuid, redirectUrl);
		res.redirect(url);
	}


	/**
	 * Initiates the logout flow.
	 *
	 * It uses the current Keycloak token (if available) as an ID token hint and then
	 * redirects the user to Keycloak’s logout endpoint.
	 */
	logout(req: Request, res: Response): void {
		const redirectUrl = req.query.redirect
			? req.query.redirect.toString()
			: "/";

		// Use a type assertion for accessing custom properties on the request, if necessary.
		const reqWithKauth = req as any;
		let idTokenHint: string | undefined;
		if (reqWithKauth.kauth?.grant?.id_token) {
			idTokenHint = reqWithKauth.kauth.grant.id_token.token;
		}

		const url = this.keycloak.logoutUrl(redirectUrl, idTokenHint);
		res.redirect(url);
		return;
	}
}
