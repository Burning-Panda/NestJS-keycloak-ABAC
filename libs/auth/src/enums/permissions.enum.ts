export enum Resources {
	REPORTS = "reports",
}

export enum Actions {
	READ = "read",
	DELETE = "delete",
	UPDATE = "update",
	CREATE = "create",
}

// Define AllowedPermissions as a constant with literal types
export const AllowedPermissions = {
	[Resources.REPORTS]: [Actions.READ, Actions.CREATE, Actions.UPDATE, Actions.DELETE],
} as const;
