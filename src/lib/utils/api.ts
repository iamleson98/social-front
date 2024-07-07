import type { GraphQLObject, GraphQLVariables, MutationStore, QueryStore } from "$houdini";
import type { RequestEvent } from "@sveltejs/kit";
import { readable } from "svelte/store";


/**
 * Some python backend APIs return result with additional `errors` field. This type is for those `errors`
 */
export type PythonBackendError = {
  errors?: {
    field?: string | null;
    message?: string | null;
  }[] | null;
};

/**
 * Common result type for backend python call only.
 */
type PythonBackendResult = GraphQLObject & PythonBackendError;

/**
 * Common result type for svelte frontend side calls only.
 */
export type SvelteBackendResult<T extends PythonBackendResult> = {
  error?: string;
  data?: T | null;
  loading: boolean;
};

/**
 * performGraphqlMutation makes mutation request to the an endpoint, the return object contains mutation result and loading state
 */
export function performGraphqlMutation<Res extends PythonBackendResult, Var extends GraphQLVariables>(
  mutation: MutationStore<Res, Var, PythonBackendResult>,
  variables: Var,
  event: RequestEvent,
) {
  const store = readable<SvelteBackendResult<Res>>({ loading: true }, (setMutationResult) => {
    mutation.
      mutate(variables, { event }).
      then(result => setMutationResult({
        loading: false,
        data: result.data,
      })).
      catch(err => setMutationResult({
        loading: false,
        error: `${err}`,
      }));
  });

  return store;
}

/**
 * performGraphqlQuery performs API query. It returns a readable store contains loading state and query result
 */
export function performGraphqlQuery<Res extends PythonBackendResult, Var extends GraphQLVariables>(
  query: QueryStore<Res, Var>,
  variables: Var,
  event: RequestEvent,
) {
  const store = readable<SvelteBackendResult<Res>>({ loading: true }, (setQueryResult) => {
    query.
      fetch({ event, variables }).
      then(result => setQueryResult({
        loading: false,
        data: result.data,
      })).
      catch(err => setQueryResult({
        loading: false,
        error: `${err}`,
      }));
  });

  return store;
}
