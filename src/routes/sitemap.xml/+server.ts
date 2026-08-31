import { PUBLIC_STORE_FRONT_URL } from '$env/static/public';
import { performServerSideGraphqlRequest } from '$lib/api/client';
import type { Query } from '$lib/gql/graphql';
import { CHANNEL_KEY, DEFAULT_CHANNEL, HTTPStatusServerError } from '$lib/utils/consts';
import { buildSitemapXml, type SitemapEntry } from '$lib/utils/sitemap';
import type { RequestHandler } from './$types';
import { error as kitError } from '@sveltejs/kit';
import { gql } from '@urql/core';

const SITEMAP_QUERIES = {
	products: gql`
		query SitemapProducts($first: Int!, $channel: String!) {
			products(first: $first, channel: $channel) {
				edges {
					node {
						slug
						updatedAt
					}
				}
			}
		}
	`,
	categories: gql`
		query SitemapCategories($first: Int!) {
			categories(first: $first, level: 0) {
				edges {
					node {
						slug
					}
				}
			}
		}
	`,
};

export const GET: RequestHandler = async (event) => {
	const baseUrl = PUBLIC_STORE_FRONT_URL || event.url.origin;
	const entries: SitemapEntry[] = [];

	try {
		const productsResult = await performServerSideGraphqlRequest<
			Pick<Query, 'products'>,
			{ first: number; channel: string }
		>(
			SITEMAP_QUERIES.products,
			{ first: 200, channel: event.cookies.get(CHANNEL_KEY) || DEFAULT_CHANNEL.slug },
			event,
			{ requestPolicy: 'network-only' },
		);

		for (const { node } of productsResult.data?.products?.edges || []) {
			if (!node?.slug) {
				continue;
			}
			entries.push({
				path: `products/${node.slug}`,
				lastModified: node.updatedAt,
				changeFrequency: 'weekly',
				priority: 0.8,
			});
		}

		const categoriesResult = await performServerSideGraphqlRequest<
			Pick<Query, 'categories'>,
			{ first: number }
		>(SITEMAP_QUERIES.categories, { first: 100 }, event, { requestPolicy: 'network-only' });

		for (const { node } of categoriesResult.data?.categories?.edges || []) {
			if (!node?.slug) {
				continue;
			}
			entries.push({
				path: `categories/${node.slug}`,
				changeFrequency: 'weekly',
				priority: 0.6,
			});
		}
	} catch {
		throw kitError(HTTPStatusServerError, 'Failed to generate sitemap');
	}

	return new Response(buildSitemapXml(baseUrl, entries), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
