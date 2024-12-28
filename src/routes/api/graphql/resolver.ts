/**
 * NOTE: This server exists to bypass some constraints like authentication of the main python API
 * and to provide a more flexible way to interact with the data.
 * Use with caution
 */

import { createSchema, createYoga } from 'graphql-yoga';
import type { RequestEvent } from '@sveltejs/kit';
import { typeDefs } from './schema';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { resolvePromotions } from '$lib/api/graphql/resolvers/promotions';
import { resolveVouchers } from '$lib/api/graphql/resolvers/vouchers';
import { AppRoute } from '$lib/utils';

const resolvers = {
	Query: {
		promotions: resolvePromotions,
		vouchers: resolveVouchers
	},
	// Mutation: {
		
	// },
};

export const server = createYoga<RequestEvent>({
	schema: createSchema({ typeDefs, resolvers }),
	graphqlEndpoint: AppRoute.GRAPHQL_API,
	fetchAPI: { Response },
	plugins: [useCookies()]
});
