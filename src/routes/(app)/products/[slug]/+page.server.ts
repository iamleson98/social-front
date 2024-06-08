// import { PRODUCT_LIST_QUERY_STORE } from "$lib/stores/api/product";
import { HTTPStatusSuccess } from "$lib/utils/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    // PRODUCT_LIST_QUERY_STORE
    return {
        status: HTTPStatusSuccess,
    };
};
