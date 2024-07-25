import type { PageLoad } from "./$types";

export const prerender = true;
export const ssr = true;

export const load: PageLoad = async (event) => {
  const parentData = await event.parent();
  // const selectedAttributes = parentData.data.attributes;
  return {
    attributes: parentData.data.attributes,
  };
}
