import { pageRequiresAuthentication } from '$lib/client';

export const load = async (event) => {
  const user = await pageRequiresAuthentication(event);
  console.log(user);
};
