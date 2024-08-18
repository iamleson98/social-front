import type { Product as TypeProduct, Query } from "$lib/gql/graphql";
import { PRODUCT_DETAIL_QUERY_STORE } from "$lib/stores/api/product";
import { CHANNEL_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusServerError } from "$lib/utils/consts";
import { error } from "@sveltejs/kit";
import { graphqlClient } from "$lib/client";
import type { LayoutServerLoad } from "./$types";
import type { WithContext, Product } from 'schema-dts';


export const load: LayoutServerLoad = async (event) => {
	const slug = event.params.slug.trim();
	const variantID = event.url.searchParams.get('variant')?.trim();

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
		slug: decodeURIComponent(slug),
		channel,
	};

	const productDetailResult = await graphqlClient.backendQuery<Pick<Query, 'product'>>(
		PRODUCT_DETAIL_QUERY_STORE,
		variables, event,
		{ requestPolicy: 'network-only' },
	);
	if (productDetailResult.error) {
		return error(HTTPStatusServerError, {
			message: productDetailResult.error.message,
		});
	}

	const product = productDetailResult.data?.product;
	const selectedVariant = variantID ? product?.variants?.find((v) => v.id === variantID) : null;

	const productJsonLd: WithContext<Product> = {
		"@context": "https://schema.org",
		"@type": "Product",
		image: product?.thumbnail?.url,
		...(selectedVariant ? {
			name: `${product?.name} - ${selectedVariant.name}`,
			description: product?.seoDescription || `${product?.name} - ${selectedVariant.name}`,
			offers: {
				"@type": "Offer",
				availability: selectedVariant.quantityAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				priceCurrency: selectedVariant.pricing?.price?.gross.currency,
				price: selectedVariant.pricing?.price?.gross.amount,
			}
		} : {
			name: product?.name,
			description: product?.seoDescription || product?.name,
			offers: {
				"@type": "AggregateOffer",
				availability: product?.variants?.some(variant => variant.quantityAvailable) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				priceCurrency: product?.pricing?.priceRange?.start?.gross.currency,
				lowPrice: product?.pricing?.priceRange?.start?.gross.amount,
				highPrice: product?.pricing?.priceRange?.stop?.gross.amount,
			}
		})
	};

	return {
		product: product as TypeProduct,
		productJsonLd,
		meta: {
			title: product?.name + '|' + product?.seoTitle,
		},
		openGraph: product?.thumbnail ? {
			images: [
				{
					url: product.thumbnail.url,
					alt: product.thumbnail.alt,
				},
			],
		} : null,
	};
};
