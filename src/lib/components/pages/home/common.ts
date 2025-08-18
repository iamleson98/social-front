/** those constants are used for product search query params */

import { tranFunc } from "$i18n";
import type { SelectOption } from "$lib/components/ui/select";
import { ProductOrderField, type Product } from "$lib/gql/graphql";
import { derived, writable } from "svelte/store";

export const ORDER_DIRECTION = 'sort';
export const ORDER_BY_FIELD = 'order-by';
export const PRICE_RANGE = 'price-range';
export const BEFORE = 'before';
export const AFTER = 'after';
export const FIRST = 'first';
export const LAST = 'last';
export const SEARCH_QUERY = 'search';

export const PRODUCT_PREVIEW_STORE = writable<Product | null>(null);

export const ProductSortFields = derived(tranFunc, (func) => {
  return [
    ProductOrderField.Price,
    ProductOrderField.Rating,
    ProductOrderField.Name,
    ProductOrderField.PublicationDate,
    ProductOrderField.MinimalPrice,
  ].map<SelectOption>((value) => ({ value, label: func(`common.${value.toLowerCase()}`) }))
})
