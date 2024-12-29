import { tClient } from "$i18n";

export const load = async () => {
  return {
    meta: {
      title: tClient("common.cart"),
    },
  };
};
