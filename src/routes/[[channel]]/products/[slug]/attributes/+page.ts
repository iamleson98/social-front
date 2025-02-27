import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = async (event) => {
  const { product: { attributes } } = await event.parent();

  return {
    attributes,
  };
}
