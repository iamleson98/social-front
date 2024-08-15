import { editorJsParser } from "$lib/utils/utils";
import type { PageLoad } from "./$types";
import xss from 'xss';

export const ssr = true;

export const load: PageLoad = async (event) => {
  const { product } = await event.parent();

  let resHtml: string[] = [];
  if (product.description) {
    const jsonData = JSON.parse(product.description as string);
    resHtml = editorJsParser.parse(jsonData).map(paragraph => xss(paragraph));
  }

  return {
    description: resHtml,
  };
};
