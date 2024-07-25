import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = async (event) => {
  const parentData = await event.parent();
  return {
    attributes: parentData.data.attributes,
  };
}
