import { tClient } from "$i18n";

export const load = async () => {
  return {
    meta: {
      title: tClient("pages.cart"),
    },
  };
};
