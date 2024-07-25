import { editorJsParser } from "$lib/utils/utils";
import type { PageLoad } from "./$types";
import xss from 'xss';

export const ssr = true;

export const load: PageLoad = async (event) => {
  const { data } = await event.parent();

  let resHtml: string[] = [];
  if (data.description) {
    const jsonData = JSON.parse(data.description as string);
    resHtml = editorJsParser.parse(jsonData).map(paragraph => xss(paragraph));
  }

  return {
    description: resHtml,
  };
};
