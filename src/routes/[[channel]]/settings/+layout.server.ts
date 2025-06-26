import { pageRequiresAuthentication } from '$lib/api/client';

// export const ssr = false;
// export const prerender = false;

export const load = async (event) => {
  const user = await pageRequiresAuthentication(event); // for normal user basic settings, admin related pages will be fine-grained
  return {
    user
  }
};
