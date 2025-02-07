import { Actions, AllowedPermissions, Resources } from "../enums/permissions.enum";
import { SetMetadata } from "@nestjs/common";

type AllowedMap = {
	// For each key in AllowedPermissions,
	// the allowed actions are the union of the array elements.
	[R in keyof typeof AllowedPermissions]: (typeof AllowedPermissions)[R][number];
};

// Now create a function that accepts a resource and an action,
// but restricts the action to only those allowed for that resource.
// The return type is now defined as "action:resource" (swapped order)
export function createPermissions<R extends keyof AllowedMap>(
	resource: R,
	action: AllowedMap[R],
): `${AllowedMap[R]}:${R}` {
	return `${action}:${resource}`;
}

// Change the parameter type so that the resource is a key of AllowedMap
export const Permissions = (...permissions: [Actions, keyof AllowedMap][]) => {
	const permissionsArray = permissions.map(([action, resource]) =>
		createPermissions(resource, action as AllowedMap[typeof resource]),
	);
	return SetMetadata("permissions", permissionsArray);
};
