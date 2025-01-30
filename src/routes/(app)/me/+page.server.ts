import { pageRequiresAuthentication } from '$lib/client';

export const load = async (event) => {
  await pageRequiresAuthentication(event);
};
