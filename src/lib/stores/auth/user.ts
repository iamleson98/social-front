import type { User } from "$lib/gql/graphql";
import { REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { persisted } from "svelte-persisted-store";
import { writable } from "svelte/store";

export const userStore = writable<User | undefined | null>(null);

/**
 * localStorageRefreshToken keeps track of refreshToken value in localstorage while works like a normal svelte store
 */
export const localStorageRefreshToken = persisted<string>(REFRESH_TOKEN_KEY, '');
