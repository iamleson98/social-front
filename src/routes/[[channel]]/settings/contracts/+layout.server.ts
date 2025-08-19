import { pageRequiresPermissions } from '$lib/api/client'
import { PermissionEnum } from '$lib/gql/graphql'

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.ManageStaff, PermissionEnum.ManageSettings, PermissionEnum.ManageUsers);

  return {
    meta: {
      title: "Contracts management - Admin",
    },
  };
};
