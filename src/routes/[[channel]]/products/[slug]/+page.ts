import { parseEditorJsString } from "$lib/utils/utils";
import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = async (event) => {
  const parent = await event.parent();

  let resHtml: string[] = [];

  if (parent?.product?.description) {
    resHtml = parseEditorJsString(parent?.product?.description as string);
  }

  return {
    description: resHtml,
  };
};
