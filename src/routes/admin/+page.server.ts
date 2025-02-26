import { pageRequiresPermissions } from "$lib/api/client";
import { PermissionEnum } from "$lib/gql/graphql";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = await pageRequiresPermissions(event, PermissionEnum.ManageProducts);

  return {
    meta: {
      title: "Admin page",
    },
    user,
  };
};
