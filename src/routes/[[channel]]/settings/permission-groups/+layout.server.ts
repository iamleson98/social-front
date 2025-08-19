import { pageRequiresPermissions } from '$lib/api/client.js'
import { PermissionEnum } from '$lib/gql/graphql.js'

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.ManageStaff);

  return {
    meta: {
      title: 'Permission groups management - Admin',
    },
  };
}
