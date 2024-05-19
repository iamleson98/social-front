import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ACCESS_TOKEN_KEY } from "$lib/stores/auth/store";

export const load: PageServerLoad = async (event) => {
  // If user is logged in but unexpectedly navigate to the signup page, 
  // We must remove the cookie
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY)
  if (accessToken) {
    event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });
  }

  return {
    status: 200,
  };
}

export const actions = {
  signup: async (event) => {
    const formData = await event.request.formData();
  },
} satisfies Actions;
