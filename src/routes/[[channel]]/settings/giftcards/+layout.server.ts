import { pageRequiresPermissions } from '$lib/api/client.js'
import { PermissionEnum } from '$lib/gql/graphql.js'

export const load = async (evt) => {
  await pageRequiresPermissions(evt, PermissionEnum.ManageGiftCard);

  return {
    meta: {
      title: 'Giftcards management - Admin',
    },
  };
}
