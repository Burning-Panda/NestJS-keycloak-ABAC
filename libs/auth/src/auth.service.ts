import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
const arctic = async () => await require("arctic");

/**
 * Auth Service
 *
 * @description
 * This service is responsible for handling the authentication process with Keycloak using ArcticJS.
 * It is responsible for validating tokens, refreshing tokens, and logging out users.
 *
 * @param {arctic.KeyCloak} keycloak - The ArcticJS Keycloak instance
 *
 * @link https://www.keycloak.org/securing-apps/oidc-layers#_oidc_available_endpoints
 */
@Injectable()
export class AuthService {
	private keycloak: arctic.KeyCloak;
	private keycloakTennant: string;

	constructor() {
		const keycloakBaseUrl = process.env.KEYCLOAK_URL;
		const realm = process.env.KEYCLOAK_REALM;
		this.keycloakTennant = `${keycloakBaseUrl}/realms/${realm}`;

		// Initialize ArcticJS Keycloak
		this.keycloak = new arctic.KeyCloak(
			this.keycloakTennant,
			process.env.KEYCLOAK_CLIENT_ID!,
			process.env.KEYCLOAK_CLIENT_SECRET!,
			process.env.KEYCLOAK_REDIRECT_URI!,
		);
	}

	// Handle User Login with Keycloak OAuth2 Password Grant
	async login(username: string, password: string) {
		try {
			// Generate state and code verifier for PKCE
			const state = arctic.generateState();
			const codeVerifier = arctic.generateCodeVerifier();
			const scopes = ["openid", "profile"];

			// Create authorization URL
			const url = await this.keycloak.createAuthorizationURL(state, codeVerifier, scopes);

			// For password grant, we'll use the token endpoint directly
			const tokenEndpoint = `${this.keycloakTennant}/protocol/openid-connect/token`;
			const formData = new URLSearchParams({
				client_id: process.env.KEYCLOAK_CLIENT_ID!,
				client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
				grant_type: "password",
				username,
				password,
				scope: scopes.join(" "),
			});

			const response = await fetch(tokenEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: formData,
			});

			if (!response.ok) {
				throw new UnauthorizedException("Invalid credentials");
			}

			const tokens = await response.json();

			return {
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				expiresIn: tokens.expires_in,
			};
		} catch (error) {
			Logger.error("Login error:", error);
			throw new UnauthorizedException("Invalid credentials");
		}
	}

	// Validate JWT Token
	async validateToken(token: string) {
		try {
			const cleanToken = token.replace(/^(Bearer|Token)\s+/i, "");

			// Debug logging for token payload
			try {
				const decoded = JSON.parse(Buffer.from(cleanToken.split(".")[1], "base64").toString());
				Logger.debug("Decoded token payload:", decoded);
				Logger.debug("Token claims:", {
					iss: decoded.iss,
					aud: decoded.aud,
					sub: decoded.sub,
				});
			} catch (e) {
				Logger.error("Failed to decode token for debugging:", e);
			}

			// Decode and validate the token
			const claims = arctic.decodeIdToken(cleanToken) as { sub?: string };

			// Additional validation if needed
			if (!claims.sub) {
				throw new Error("Token payload missing subject claim");
			}

			return claims;
		} catch (error) {
			Logger.error("Token validation error:", error);
			if (error instanceof Error) {
				Logger.error("Error name:", error.name);
				Logger.error("Error message:", error.message);
			}
			throw new UnauthorizedException("Invalid access token");
		}
	}

	// Handle Refresh Token
	async refreshToken(refreshToken: string) {
		try {
			const tokens = await this.keycloak.refreshAccessToken(refreshToken);

			return {
				accessToken: tokens.accessToken(),
				refreshToken: tokens.refreshToken(),
			};
		} catch (error) {
			Logger.error("Refresh token error:", error);
			throw new UnauthorizedException("Invalid refresh token");
		}
	}

	// Handle User Logout
	async logout(user: any) {
		try {
			if (user.access_token) {
				await this.keycloak.revokeToken(user.access_token);
			}
			if (user.refresh_token) {
				await this.keycloak.revokeToken(user.refresh_token);
			}

			return { message: "Logged out successfully" };
		} catch (error) {
			Logger.error("Logout failed:", error);
			throw new UnauthorizedException("Failed to logout");
		}
	}

	// 🔹 Get User Info
	async getMe(user: any) {
		const userEndpoint = `${this.keycloakTennant}/protocol/openid-connect/userinfo`;

		try {
			const response = await fetch(userEndpoint, {
				headers: { Authorization: `Bearer ${user.access_token}` },
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user info");
			}

			const data = await response.json();
			Logger.log(data);
			return data;
		} catch (error) {
			Logger.error("Failed to get user info:", error);
			throw new UnauthorizedException("Failed to get user info");
		}
	}
}
