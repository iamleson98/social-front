import { pageRequiresAuthentication } from '$lib/api/client'
import { PermissionEnum } from '$lib/gql/graphql.js';
import { HTTPStatusPermanentRedirect } from '$lib/utils/consts.js';
import { AppRoute } from '$lib/utils/routes.js';
import { checkUserHasPermissions } from '$lib/utils/utils'
import { redirect } from '@sveltejs/kit';

export const load = async (evt) => {
  const user = await pageRequiresAuthentication(evt);
  const canEditStore = checkUserHasPermissions(user, PermissionEnum.ManageSettings);

  if (!canEditStore) redirect(HTTPStatusPermanentRedirect, AppRoute.SETTINGS());

  return {
    meta: {
      title: 'Store Settings',
    },
  };
}
