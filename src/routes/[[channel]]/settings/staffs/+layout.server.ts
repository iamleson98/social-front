import { pageRequiresPermissions } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql';


export const load = async (event) => {
  const user = await pageRequiresPermissions(event, PermissionEnum.ManageStaff);
  return { user, meta: { title: 'Staffs management - Admin' } };
}
