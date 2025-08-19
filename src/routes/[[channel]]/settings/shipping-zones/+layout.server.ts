import { pageRequiresPermissions } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql.js';

export const load = async (event) => {
  const user = await pageRequiresPermissions(event, PermissionEnum.ManageShipping); // for normal user basic settings, admin related pages will be fine-grained
  return {
    user,
    meta: {
			title: 'Shipping zones management - Admin'
		},
  };
};
