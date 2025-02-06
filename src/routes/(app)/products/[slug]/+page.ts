import { parseProductDescription } from "$lib/utils/utils";
import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = async (event) => {
  const parent = await event.parent();

  console.log(parent);

  let resHtml: string[] = [];

  if (parent?.product?.description) {
    resHtml = parseProductDescription(parent?.product?.description as string);
  }

  return {
    description: resHtml,
  };
};
