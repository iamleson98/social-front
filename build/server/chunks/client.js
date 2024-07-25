import { A as ACCESS_TOKEN_KEY } from "./consts.js";
import { fromPromise, pipe, filter, take, toPromise, subscribe } from "wonka";
import { cacheExchange, fetchExchange, Client, CombinedError } from "@urql/core";
function withPromise(_source$) {
  const source$ = (sink) => _source$(sink);
  source$.toPromise = () => pipe(
    source$,
    filter((result) => !result.stale && !result.hasNext),
    take(1),
    toPromise
  );
  source$.then = (onResolve, onReject) => source$.toPromise().then(onResolve, onReject);
  source$.subscribe = (onResult) => subscribe(onResult)(source$);
  return source$;
}
const suggestMethodMap = {
  query: "backendQuery",
  mutation: "backendMutation",
  subscription: "backendSubscription",
  teardown: "backendTeardown"
};
class SocialGraphqlClient extends Client {
  constructor(options) {
    super(options);
  }
  query(query, variables, context) {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("query", context);
    return super.query(query, variables, newContext);
  }
  mutation(query, variables, context) {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("mutation", context);
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        reject(
          new CombinedError({
            networkError: new Error("Query timeout")
          })
        );
      }, 5e3);
      super.mutation(query, variables, newContext).toPromise().then(resolve).catch(reject).finally(() => clearTimeout(timeout));
    });
    return withPromise(fromPromise(promise));
  }
  attachAuthorizationHeaderToContextIfNedded = (operation, context, event) => {
    if (!event) {
      throw new Error(
        `Calling API from server-side requires RequestEvent. Please use ${suggestMethodMap[operation]} instead.`
      );
    }
    const newContext = context || {};
    let accessToken = "";
    if (event) {
      accessToken = event.cookies.get(ACCESS_TOKEN_KEY) || "";
    }
    if (accessToken) {
      newContext.fetchOptions = {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      };
    }
    return newContext;
  };
  /**
   * This method is similar to `query` but is used for backend only
   */
  backendQuery = (query, variables, event, context) => {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("query", context, event);
    return this.query(query, variables, newContext).toPromise();
  };
  /**
   * This method is similar to `mutation` but is used for backend
   */
  backendMutation = (query, variables, event, context) => {
    const newContext = this.attachAuthorizationHeaderToContextIfNedded("mutation", context, event);
    return this.mutation(query, variables, newContext).toPromise();
  };
}
const graphqlClient = new SocialGraphqlClient({
  url: "https://sitename.saleor.cloud/graphql/",
  exchanges: [cacheExchange, fetchExchange]
});
export {
  graphqlClient as g
};
