import { pageRequiresPermissions } from '$lib/api/client.js'
import { PermissionEnum } from '$lib/gql/graphql.js'

export const load = async (evt) => {
	await pageRequiresPermissions(evt, PermissionEnum.ManageStaff, PermissionEnum.ManageUsers, PermissionEnum.ManageSettings);
	return {
		meta: {
			title: 'New Permission Group'
		}
	};
};