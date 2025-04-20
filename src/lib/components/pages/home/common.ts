/** those constants are used for product search query params */

import type { Product } from "$lib/gql/graphql";
import { writable } from "svelte/store";

export const ORDER_DIRECTION = 'sort';
export const ORDER_BY_FIELD = 'order-by';
export const PRICE_RANGE = 'price-range';
export const BEFORE = 'before';
export const AFTER = 'after';
export const FIRST = 'first';
export const LAST = 'last';

export const PRODUCT_PREVIEW_STORE = writable<Product | null>(null);
