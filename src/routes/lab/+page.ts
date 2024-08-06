import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { HTTPStatusPermanentRedirect } from "$lib/utils/consts";
import { dev } from "$app/environment";

export const load: PageLoad = async () => {
  if (!dev) {
    redirect(HTTPStatusPermanentRedirect, '/');
  }
};
