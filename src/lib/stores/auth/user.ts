import type { User } from '$lib/gql/graphql';
import { writable } from 'svelte/store';

export const UserStoreManager = (() => {
  const { set, subscribe } = writable<User | undefined | null>(null);

  return {
    subscribe,
    setValue: (value: User | null) => set(value),
  };
})();
