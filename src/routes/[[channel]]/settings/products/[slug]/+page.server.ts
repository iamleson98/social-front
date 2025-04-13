import { pageRequiresPermissions } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql.js';

export const ssr = false;
export const prerender = false;

export const load = async (event) => {
  const user = await pageRequiresPermissions(event, PermissionEnum.ManageProducts, PermissionEnum.ManageProductTypesAndAttributes); // for normal user basic settings, admin related pages will be fine-grained
  return {
    user,
    meta: {
			title: 'Edit Product'
		}
  }
};
