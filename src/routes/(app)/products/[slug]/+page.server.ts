import type { Product, Query } from "$lib/gql/graphql";
import { PRODUCT_DETAIL_QUERY_STORE } from "$lib/stores/api/product";
import { DEFAULT_CHANNEL_NAME, HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { graphqlClient } from "$lib/client";
import { CHANNEL_KEY } from "$lib/stores/auth/store";


export const load: PageServerLoad = async (event): Promise<SocialResponse<Product>> => {
	const slug = event.params.slug.trim();
	if (!slug) {
		return error(
			HTTPStatusBadRequest,
			{ message: "Invalid product slug", }
		);
	}

	let channel = event.cookies.get(CHANNEL_KEY);
	if (!channel) {
		channel = DEFAULT_CHANNEL_NAME;
	}

	const variables = {
		slug,
		channel,
	};

	const productDetailResult = await graphqlClient.backendQuery<Pick<Query, 'product'>>(PRODUCT_DETAIL_QUERY_STORE, variables, event);	
	if (productDetailResult.error) {
		return error(HTTPStatusServerError, {
			message: productDetailResult.error.message,
		});
	}

	return {
		status: HTTPStatusSuccess,
		data: productDetailResult.data?.product as Product,
	};
};
