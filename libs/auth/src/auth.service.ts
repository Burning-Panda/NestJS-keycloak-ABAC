import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import axios from "axios";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

@Injectable()
export class AuthService {
	private jwksUri: string;
	private jwks: ReturnType<typeof createRemoteJWKSet>;
	private keycloakTennant: string;

	constructor() {
		const keycloakBaseUrl = process.env.KEYCLOAK_URL;
		const realm = process.env.KEYCLOAK_REALM;
		this.keycloakTennant = `${keycloakBaseUrl}/realms/${realm}`;
		this.jwksUri = `${this.keycloakTennant}/protocol/openid-connect/certs`;
		this.jwks = createRemoteJWKSet(new URL(this.jwksUri));
	}

	// 🔹 Handle User Login with Keycloak OAuth2 Password Grant
	async login(username: string, password: string) {
		const tokenEndpoint = `${this.keycloakTennant}/protocol/openid-connect/token`;

		try {
			const response = await axios.post(
				tokenEndpoint,
				new URLSearchParams({
					client_id: process.env.KEYCLOAK_CLIENT_ID!,
					client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
					grant_type: "password",
					username,
					password,
				}),
				{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
			);

			return {
				accessToken: response.data.access_token,
				refreshToken: response.data.refresh_token,
				expiresIn: response.data.expires_in,
			};
		} catch (error) {
			throw new UnauthorizedException("Invalid credentials");
		}
	}

	// 🔹 Validate JWT Token
	async validateToken(token: string): Promise<JWTPayload> {
		try {
			const { payload } = await jwtVerify(token, this.jwks, {
				issuer: `${this.keycloakTennant}`,
				//audience: process.env.KEYCLOAK_CLIENT_ID!,
			});

			return payload;
		} catch (error) {
			Logger.error(error);
			throw new UnauthorizedException("Invalid access token");
		}
	}

	// 🔹 Handle Refresh Token
	async refreshToken(refreshToken: string) {
		const tokenEndpoint = `${this.keycloakTennant}/protocol/openid-connect/token`;

		try {
			const response = await axios.post(
				tokenEndpoint,
				new URLSearchParams({
					client_id: process.env.KEYCLOAK_CLIENT_ID!,
					client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
					grant_type: "refresh_token",
					refresh_token: refreshToken,
				}),
				{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
			);

			return {
				accessToken: response.data.access_token,
				refreshToken: response.data.refresh_token,
			};
		} catch (error) {
			throw new UnauthorizedException("Invalid refresh token");
		}
	}

	// 🔹 Handle User Logout
	async logout(user: JWTPayload) {
		const tokenEndpoint = `${this.keycloakTennant}/protocol/openid-connect/logout`;

		try {
			await axios.post(tokenEndpoint, {
				client_id: process.env.KEYCLOAK_CLIENT_ID!,
				refresh_token: user.refresh_token,
			});

			return { message: "Logged out successfully" };
		} catch (error) {
			throw new UnauthorizedException("Failed to logout");
		}
	}

	// 🔹 Get User Info
	async getMe(user: JWTPayload) {
		const userEndpoint = `${this.keycloakTennant}/protocol/openid-connect/userinfo`;

		try {
			const response = await axios.get(userEndpoint, { headers: { Authorization: `Bearer ${user.access_token}` } });
			Logger.log(response.data);
			return response.data;
		} catch (error) {
			Logger.error(error);
			throw new UnauthorizedException("Failed to get user info");
		}
	}
}
