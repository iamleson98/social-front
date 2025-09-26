import type { User } from '$lib/gql/graphql';
import { writable } from 'svelte/store';

export const UserStoreManager = (() => {
  const innerStore = writable<User | undefined | null>(null);

  return {
    subscribe: innerStore.subscribe,
    setValue: (value: User | null) => innerStore.set(value),
  };
})();
