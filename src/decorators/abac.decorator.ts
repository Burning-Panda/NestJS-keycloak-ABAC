import { SetMetadata } from "@nestjs/common";

/**
 * Keys used to store metadata on route handlers.
 */
export const RESOURCE_KEY = "abac_resource";
export const ACTION_KEY = "abac_action";
export const ATTRIBUTES_KEY = "abac_attributes";

/**
 * Decorator to specify the resource that is being accessed.
 *
 * @param resource - The name (or identifier) of the resource.
 */
export const Resource = (resource: string) =>
	SetMetadata(RESOURCE_KEY, resource);

/**
 * Decorator to specify the action that is being performed on the resource.
 *
 * @param action - The action (e.g., 'read', 'create', 'update', 'delete').
 */
export const Action = (action: string) => SetMetadata(ACTION_KEY, action);

/**
 * Decorator to specify additional required attributes (as an array of strings).
 *
 * @param attributes - A list of attributes that must be present.
 */
export const Attributes = (attributes: string[]) =>
	SetMetadata(ATTRIBUTES_KEY, attributes);

/**
 * Composite decorator that combines resource, action, and attributes.
 *
 * @param policy - An object describing the ABAC policy.
 */
export interface ABACPolicy {
	resource?: string;
	action?: string;
	attributes?: string[];
}

export const AccessPolicy = (policy: ABACPolicy) => {
	return (target: any, key?: any, descriptor?: any) => {
		if (policy.resource) {
			Resource(policy.resource)(target, key, descriptor);
		}
		if (policy.action) {
			Action(policy.action)(target, key, descriptor);
		}
		if (policy.attributes) {
			Attributes(policy.attributes)(target, key, descriptor);
		}
	};
};
