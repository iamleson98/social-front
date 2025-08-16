import { pageRequiresPermissions } from '$lib/api/client'
import { PermissionEnum } from '$lib/gql/graphql'

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.HandleTaxes, PermissionEnum.ManageTaxes)

  return {
    meta: {
      title: 'Tax Settings',
    },
  };
};
