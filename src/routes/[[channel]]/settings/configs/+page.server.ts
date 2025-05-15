import { pageRequiresPermissions } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql';

export const prerender = true;
export const ssr = true;

export const load = async (event) => {
  const user = await pageRequiresPermissions(event, PermissionEnum.ManageSettings);
  return { user, meta: { title: 'Manage Configurations' } };
};
