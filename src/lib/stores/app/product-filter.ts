import type { QueryProductsArgs } from '$lib/gql/graphql';
import { getCookieByKey } from '$lib/utils';
import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
import { writable } from 'svelte/store';

/** this store keeps track of products filter options  */
export const productFilterParamStore = writable<QueryProductsArgs>({
  channel: getCookieByKey(CHANNEL_KEY) || defaultChannel.slug,
  first: 10,
});
