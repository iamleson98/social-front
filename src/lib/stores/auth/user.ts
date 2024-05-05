import type { User } from "$lib/gql/graphql";
import { writable } from "svelte/store";

export const userStore = writable<User | null>(null);
