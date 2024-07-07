import { browser } from '$app/environment';
import { HoudiniClient } from '$houdini';
import { ACCESS_TOKEN_KEY } from '$lib/stores/auth/store';
import { getCookieByKey } from '$lib/utils';
import { VITE_GRAPHQL_API_END_POINT } from "$env/static/private";

export default new HoudiniClient({
  url: VITE_GRAPHQL_API_END_POINT,
  fetchParams() {
    const headers: HeadersInit = {};

    // when sveltejs frontend make API call to python backend or svelte kit backend
    if (browser) {
      const tokenCookie = getCookieByKey(ACCESS_TOKEN_KEY);
      if (tokenCookie.length) {
        headers['Authorization'] = `Bearer ${tokenCookie}`;
      }
    }

    return {
      headers,
    };
  },
});
