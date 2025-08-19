import { pageRequiresPermissions } from '$lib/api/client'
import { PermissionEnum } from '$lib/gql/graphql'

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.ManageProductTypesAndAttributes);

  return {
    meta: {
      title: "Attributes management - Admin",
    },
  };
};
