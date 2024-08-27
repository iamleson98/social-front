import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import type { RequestEvent } from '@sveltejs/kit'
import { typeDefs } from './schema';
import { books } from './data';
import { useGraphQlJit } from '@envelop/graphql-jit';
import { useCookies } from '@whatwg-node/server-plugin-cookies';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: async (root: unknown, args: Record<string, string>, context: YogaInitialContext) => {
      // console.log(root, args, await context.request.cookieStore?.getAll());

      return books.filter(bok => bok.title.toLowerCase().includes(args.title.toLowerCase()));
      // return books;
    },
  },
};

export const server = createYoga<RequestEvent>({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/apollo',
  fetchAPI: { Response },
  plugins: [
    useGraphQlJit(),
    useCookies(),
  ],
});
