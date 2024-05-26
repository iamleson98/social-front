import { PRODUCT_LIST_QUERY_STORE } from "$lib/stores/api/product";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    PRODUCT_LIST_QUERY_STORE
    return {

    };
};
