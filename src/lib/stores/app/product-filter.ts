import type { QueryProductsArgs } from '$lib/gql/graphql';
import { writable } from 'svelte/store';

/** this store keeps track of products filter options  */
export const productFilterParamStore = writable<QueryProductsArgs>({});
