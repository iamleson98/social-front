// import { isBrowser } from "$houdini";
import { accessTokenKey } from "$lib/stores/auth/store";
// import { getCookieByKey } from "$lib/utils";
import type { HandleFetch } from "@sveltejs/kit";


export const handleFetch: HandleFetch = async ({ event, fetch, request }) => {
  let headerToken = '';

  headerToken = event.cookies.get(accessTokenKey) as string;
  if (headerToken) {
    request.headers.set("Authorization", `Bearer ${headerToken}`);
  }
  return await fetch(request);
}
