import { pageRequiresPermissions } from "$lib/api/client";
import { PermissionEnum } from "$lib/gql/graphql.js";

export const load = async (event) => {
	await pageRequiresPermissions(event, PermissionEnum.ManageProducts, PermissionEnum.ManageProductTypesAndAttributes);
	return {
		meta: {
			title: 'New Product'
		}
	}
};
