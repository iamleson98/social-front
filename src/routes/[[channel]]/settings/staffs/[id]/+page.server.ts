import { pageRequiresAuthentication } from '$lib/api/client';
import { PermissionEnum } from '$lib/gql/graphql.js';
import { checkUserHasPermissions } from '$lib/utils/utils.js';

export const load = async (event) => {
  // only staff himself can edit his staff information
  const user = await pageRequiresAuthentication(event);

  return {
    canEdit: user.id === event.params.id,
    isStaffManager: checkUserHasPermissions(user, PermissionEnum.ManageStaff),
  };
};
