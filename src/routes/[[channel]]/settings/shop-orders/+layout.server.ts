import { pageRequiresPermissions } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql';


export const load = async (event) => {
  const user = await pageRequiresPermissions(event, PermissionEnum.ManageOrders);
  return { user, meta: { title: 'Orders management - Admin' } };
}
