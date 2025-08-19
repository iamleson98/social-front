import { pageRequiresAuthentication } from '$lib/api/client';


export const load = async (event) => {
  const user = await pageRequiresAuthentication(event);
  return { user, meta: { title: 'My preferences' } };
};

