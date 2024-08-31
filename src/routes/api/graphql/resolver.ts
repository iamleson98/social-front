import { createSchema, createYoga } from 'graphql-yoga'
import type { RequestEvent } from '@sveltejs/kit'
import { typeDefs } from './schema';
import { useGraphQlJit } from '@envelop/graphql-jit';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { resolvePromotions } from '$lib/api/graphql/resolvers/promotions';


const resolvers = {
  Query: {
    promotions: resolvePromotions,
  },
};

export const server = createYoga<RequestEvent>({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  plugins: [
    useGraphQlJit(),
    useCookies(),
  ],
});
