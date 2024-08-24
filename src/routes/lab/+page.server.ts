import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { HTTPStatusPermanentRedirect } from "$lib/utils/consts";
import { dev } from "$app/environment";

export const load: PageServerLoad = async () => {
  if (!dev) {
    return redirect(HTTPStatusPermanentRedirect, '/');
  }
};
