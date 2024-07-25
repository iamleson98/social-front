import type { Product, Query } from "$lib/gql/graphql";
import { PRODUCT_DETAIL_QUERY_STORE } from "$lib/stores/api/product";
import { CHANNEL_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess } from "$lib/utils/consts";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { graphqlClient } from "$lib/client";


export const load: LayoutServerLoad = async (event) => {
	// console.log(event.url.searchParams.get('tab'));

	const slug = event.params.slug.trim();
	if (!slug) {
		return error(
			HTTPStatusBadRequest,
			{ message: "Invalid product slug", }
		);
	}

	let channel = event.cookies.get(CHANNEL_KEY);
	if (!channel) {
		channel = defaultChannel.slug;
	}

	const variables = {
		slug,
		channel,
	};

	const productDetailResult = await graphqlClient.backendQuery<Pick<Query, 'product'>>(PRODUCT_DETAIL_QUERY_STORE, variables, event, { requestPolicy: 'network-only' });
	if (productDetailResult.error) {
		return error(HTTPStatusServerError, {
			message: productDetailResult.error.message,
		});
	}

	return {
		status: HTTPStatusSuccess,
		data: productDetailResult.data?.product as Product,
		meta: {
			title: productDetailResult.data?.product?.name,
		},
	};
};
