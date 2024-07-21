// import { CATEGORIES_LIST_QUERY_STORE } from "$lib/stores/api/product";
import { HTTPStatusSuccess } from "$lib/utils/consts";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // CATEGORIES_LIST_QUERY_STORE.fetch()
  return {
    status: HTTPStatusSuccess,
  };
};


export const actions = {
  fetchCategoryList: async (event) => {
    event.params
  },
} satisfies Actions;
