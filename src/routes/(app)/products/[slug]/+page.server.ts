import type { Product } from "$lib/gql/graphql";
import { PRODUCT_DETAIL_QUERY_STORE } from "$lib/stores/api/product";
import { DEFAULT_CHANNEL_NAME, HTTPStatusBadRequest, HTTPStatusNotFound, HTTPStatusServerError, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event): Promise<SocialResponse<Product>> => {
	const slug = event.params.slug.trim();

	if (!slug) {
		return {
			status: HTTPStatusBadRequest,
			error: "Invalid product slug",
		};
	}

	const productDetailResult = await PRODUCT_DETAIL_QUERY_STORE.fetch({
		variables: {
			slug,
			channel: DEFAULT_CHANNEL_NAME,
		},
		event,
	});

	// internal error
	if (productDetailResult.errors?.length) {
		return error(HTTPStatusServerError, {
			message: productDetailResult.errors[0].message,
		});
	}

	// not found
	if (!productDetailResult.data || !productDetailResult.data.product) {
		return error(HTTPStatusNotFound, {
			message: "Product not found",
		});
	}

	return {
		status: HTTPStatusSuccess,
		data: productDetailResult.data?.product as Product,
	};
};
