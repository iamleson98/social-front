import type { Shop } from '$lib/gql/graphql';
import { writable } from 'svelte/store';


export const ShopStoreManager = (() => {
  const innerStore = writable<Shop | undefined>();

  return {
    subscribe: innerStore.subscribe,
    setValue: (value: Shop | undefined) => innerStore.set(value),
  };
})();

