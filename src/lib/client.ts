import { cacheExchange, Client, fetchExchange, type AnyVariables, type ClientOptions, type DocumentInput, type OperationContext, type OperationResult, type OperationResultSource } from '@urql/svelte';
import { getCookieByKey } from './utils';
import { ACCESS_TOKEN_KEY } from './stores/auth/store';
import type { RequestEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';


type GraphqlOperation = "query" | "mutation" | "subscription";

const suggestMethodMap: Record<GraphqlOperation, string> = {
  query: "backendQuery",
  mutation: "backendMutation",
  subscription: "backendSubscription",
};

class SocialGraphqlClient extends Client {
  constructor(options: ClientOptions) {
    super(options);
  }

  query<Data = unknown, Variables extends AnyVariables = AnyVariables>(query: DocumentInput<Data, Variables>, variables: Variables, context?: Partial<OperationContext>): OperationResultSource<OperationResult<Data, Variables>> {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("query", context);
    return super.query(query, variables, newContext);
  }

  mutation<Data = unknown, Variables extends AnyVariables = AnyVariables>(query: DocumentInput<Data, Variables>, variables: Variables, context?: Partial<OperationContext>): OperationResultSource<OperationResult<Data, Variables>> {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("mutation", context);
    return super.mutation(query, variables, newContext);
  }

  private attachAuthorizationHeaderToContextIfNedded = (
    operation: GraphqlOperation,
    context?: Partial<OperationContext>,
    event?: RequestEvent<Partial<Record<string, string>>, string | null>,
  ) => {
    if (!browser && !event) {
      throw new Error(`Calling API from server-side requires RequestEvent. Please use ${suggestMethodMap[operation]} instead.`);
    }

    const newContext = context || {};
    let accessToken = '';

    if (browser) {
      accessToken = getCookieByKey(ACCESS_TOKEN_KEY);
    } else if (event) {
      accessToken = event.cookies.get(ACCESS_TOKEN_KEY) || '';
    }

    if (accessToken) {
      newContext.fetchOptions = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }

    return newContext;
  }

  /**
   * This method is similar to `query` but is used for backend only
   */
  backendQuery = <Data = never, Variables extends AnyVariables = AnyVariables>(
    query: DocumentInput<Data, Variables>,
    variables: Variables,
    event: RequestEvent<Partial<Record<string, string>>, string | null>,
    context?: Partial<OperationContext>
  ): Promise<OperationResult<Data, Variables>> => {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("query", context, event);
    return this.query(query, variables, newContext).toPromise();
  }

  /**
   * This method is similar to `mutation` but is used for backend
   */
  backendMutation = <Data = never, Variables extends AnyVariables = AnyVariables>(
    query: DocumentInput<Data, Variables>,
    variables: Variables,
    event: RequestEvent<Partial<Record<string, string>>, string | null>,
    context?: Partial<OperationContext>
  ): Promise<OperationResult<Data, Variables>> => {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("mutation", context, event);
    return this.mutation(query, variables, newContext).toPromise();
  }
}

/**
 * graphqlClient is similar to 'Client' of urql but with additional methods for server-side.
 */
export const graphqlClient = new SocialGraphqlClient({
  url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
  exchanges: [cacheExchange, fetchExchange],
});
