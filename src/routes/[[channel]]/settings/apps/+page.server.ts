import { pageRequiresPermissions } from '$lib/api/client'
import { PermissionEnum } from '$lib/gql/graphql'

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.ManageApps);

  return {
    meta: {
      title: "Apps management - Admin",
    },
  };
};
