import { serverSideTranslate } from "$i18n";

export const load = async (event) => {
  return {
    meta: {
      title: await serverSideTranslate(event, 'common.cart'),
    },
  };
};
