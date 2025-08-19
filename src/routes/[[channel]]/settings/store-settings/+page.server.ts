import { pageRequiresPermissions } from '$lib/api/client'
import { PermissionEnum } from '$lib/gql/graphql.js';
import { HTTPStatusPermanentRedirect } from '$lib/utils/consts.js';
import { AppRoute } from '$lib/utils/routes.js';
import { redirect } from '@sveltejs/kit';

export const load = async (evt) => {
  const user = await pageRequiresPermissions(evt, PermissionEnum.ManageSettings)

  if (!user) redirect(HTTPStatusPermanentRedirect, AppRoute.SETTINGS());

  return {
    meta: {
      title: 'Store Settings - Admin',
    },
  };
}
