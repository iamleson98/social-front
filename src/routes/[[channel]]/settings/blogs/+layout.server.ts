import { pageRequiresPermissions } from "$lib/api/client"
import { PermissionEnum } from "$lib/gql/graphql"

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.ManagePages);

  return {
    meta: {
      title: 'Blogs - Admin',
    },
  };
};
