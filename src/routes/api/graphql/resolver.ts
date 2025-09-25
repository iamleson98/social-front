/**
 * NOTE: This server exists to bypass some constraints like authentication of the main python API
 * and to provide a more flexible way to interact with the data.
 * Use with caution
 */
import { resolvePromotions } from '$lib/api/graphql/resolvers/promotions';
import { AppRoute } from '$lib/utils';
import { typeDefs } from './schema';
import type { RequestEvent } from '@sveltejs/kit';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { createSchema, createYoga } from 'graphql-yoga';

const resolvers = {
	Query: {
		promotions: resolvePromotions,
	},
};

export const server = createYoga<RequestEvent>({
	schema: createSchema({ typeDefs, resolvers }),
	graphqlEndpoint: AppRoute.GRAPHQL_API,
	fetchAPI: { Response },
	plugins: [useCookies()],
});
