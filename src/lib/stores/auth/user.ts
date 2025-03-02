import type { User } from '$lib/gql/graphql';
import { get, readonly, writable } from 'svelte/store';

const userStore = writable<User | undefined | null>(null);

/**
  NOTE: Only call this function in authen or author pages, as it can result in unexpected UI behaviors
 */
export const setUserStoreValue = (user: User | null) => userStore.set(user);

export const getUserStoreValue = () => get(userStore);

export const READ_ONLY_USER_STORE = readonly(userStore);
