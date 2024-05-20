import { ACCESS_TOKEN_KEY } from "$lib/stores/auth/store";
import type { HandleFetch } from '@sveltejs/kit';


export const handleFetch: HandleFetch = async ({ event, fetch, request }) => {
  const headerToken = event.cookies.get(ACCESS_TOKEN_KEY) as string;
  if (headerToken) {
    request.headers.set("Authorization", `Bearer ${headerToken}`);
  }
  const response = await fetch(request);
  return response;
}
