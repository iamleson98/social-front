import { parseProductDescription } from "$lib/utils/utils";
import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = async (event) => {
  const { product: { description } } = await event.parent();

  let resHtml: string[] = [];

  if (description) {
    resHtml = parseProductDescription(description as string);
  }

  return {
    description: resHtml,
  };
};
