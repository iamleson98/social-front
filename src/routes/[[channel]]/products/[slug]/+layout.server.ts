import { type Product as TypeProduct, type Query, type QueryProductArgs } from "$lib/gql/graphql";
import { CHANNEL_KEY, COUNTRY_CODE_KEY, HTTPStatusPermanentRedirect, HTTPStatusServerError } from "$lib/utils/consts";
import { error, redirect } from "@sveltejs/kit";
import { performServerSideGraphqlRequest } from "$lib/api/client";
import type { WithContext, Product } from 'schema-dts';
import { PRODUCT_DETAIL_QUERY } from "$lib/api";
import { DEFAULT_CHANNEL } from "$lib/utils/channels";
import { AppRoute } from "$lib/utils/routes.js";


export const load = async (event) => {
	const slug = event.params.slug.trim();
	const variantID = event.url.searchParams.get('variant')?.trim();

	if (!slug) {
		redirect(HTTPStatusPermanentRedirect, AppRoute.HOME());
	}

	const channel = event.cookies.get(CHANNEL_KEY);
	const variables: QueryProductArgs & { countryCode: string } = {
		slug: decodeURIComponent(slug),
		channel,
		countryCode: event.cookies.get(COUNTRY_CODE_KEY) || DEFAULT_CHANNEL.defaultCountryCode,
	};

	const productDetailResult = await performServerSideGraphqlRequest<Pick<Query, 'product'>, QueryProductArgs>(
		'query',
		PRODUCT_DETAIL_QUERY,
		variables,
		event,
		{ requestPolicy: 'cache-and-network' },
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
			title: product?.name || product?.slug,
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
