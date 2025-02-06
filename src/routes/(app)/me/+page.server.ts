import { pageRequiresAuthentication } from '$lib/api/client';

export const load = async (event) => {
  await pageRequiresAuthentication(event);
};
