import type { PageLoad } from "./$types";

export const load: PageLoad = async (evt) => {
  return await evt.parent();
};
