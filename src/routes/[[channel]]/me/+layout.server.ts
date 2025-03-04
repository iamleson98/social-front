import { pageRequiresAuthentication } from '$lib/api/client';

export const ssr = false;
export const prerender = false;

export const load = async (event) => {
  const user = await pageRequiresAuthentication(event);
  return {
    user
  }
};
