import { pageRequiresPermissions } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql';

export const load = async (event) => {
  await pageRequiresPermissions(event, PermissionEnum.ManageProducts, PermissionEnum.ManageProductTypesAndAttributes);

  return {
		meta: {
			title: 'Update product'
		}
	};
}
