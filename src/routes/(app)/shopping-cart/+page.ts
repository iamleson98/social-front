import { tranFunc } from "$i18n";
import { get } from "svelte/store";

export const load = async () => {
  return {
    meta: {
      title: get(tranFunc)("common.cart"),
    },
  };
};
