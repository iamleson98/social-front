import type { Shop } from "$lib/gql/graphql";
import { readonly, writable } from "svelte/store";

const ShopStore = writable<Shop | undefined>();

export const READ_ONLY_SHOP_STORE = readonly(ShopStore);

export const setShopStoreValue = (shop?: Shop) => ShopStore.set(shop);
