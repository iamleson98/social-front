import type { User } from '$lib/gql/graphql';
import { writable } from 'svelte/store';

export const ME_PAGE_USER_STORE = writable<User | null>(null);
