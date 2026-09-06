/** those constants are used for product search query params */
import { T } from '$i18n';
import type { TranslationKey } from '$i18n/types';
import type { SelectOption } from '$lib/components/ui/select';
import { ProductOrderField, type Product } from '$lib/gql/graphql';
import { derived, writable } from 'svelte/store';

export const PRODUCT_PREVIEW_STORE = writable<Product | null>(null);

/** storefront sort options: [graphql sort field, label translation key] */
const SORT_FIELD_OPTIONS: readonly (readonly [ProductOrderField, TranslationKey])[] = [
	[ProductOrderField.Price, 'common.price'],
	[ProductOrderField.Rating, 'common.rating'],
	[ProductOrderField.Name, 'common.name'],
	[ProductOrderField.PublishedAt, 'common.publishedAt'],
	[ProductOrderField.MinimalPrice, 'common.minimalPrice'],
];

export const ProductSortFields = derived(T, (func) => {
	return SORT_FIELD_OPTIONS.map<SelectOption>(([value, labelKey]) => ({
		value,
		label: func(labelKey),
	}));
});
