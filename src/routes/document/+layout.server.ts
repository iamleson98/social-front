import { dev } from "$app/environment";
import { AppRoute } from "$lib/utils";
import { HTTPStatusPermanentRedirect } from "$lib/utils/consts";
import { redirect } from "@sveltejs/kit";

export const prerender = true;

export const load = async () => {
  if (!dev) {
    redirect(HTTPStatusPermanentRedirect, AppRoute.HOME());
  }

  return {
    meta: {
      title: "Sitename Documentation",
    },
  };
};
