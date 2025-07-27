import { type ShippingZone } from "$lib/gql/graphql";
import { writable } from "svelte/store";

export const ActiveShippingZone = writable<ShippingZone | null>(null);
