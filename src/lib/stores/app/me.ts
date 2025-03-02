import { writable } from "svelte/store";
import type { User } from "$lib/gql/graphql";

export const ME_PAGE_USER_STORE = writable<User | null>(null);
