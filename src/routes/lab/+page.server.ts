import { redirect } from "@sveltejs/kit";
import { HTTPStatusPermanentRedirect } from "$lib/utils/consts";
import { dev } from "$app/environment";


export const load = async () => {
  if (!dev) {
    return redirect(HTTPStatusPermanentRedirect, '/');
  }

  return {
    meta: {
      title: 'Lab page - where developers showcase their experiments'
    }
  }
};
