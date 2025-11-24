/** those constants are used for product search query params */
import { tranFunc } from '$i18n';
import type { SelectOption } from '$lib/components/ui/select';
import { ProductOrderField, type Product } from '$lib/gql/graphql';
import { derived, writable } from 'svelte/store';


export const PRODUCT_PREVIEW_STORE = writable<Product | null>(null);

export const ProductSortFields = derived(tranFunc, (func) => {
	return [
		ProductOrderField.Price,
		ProductOrderField.Rating,
		ProductOrderField.Name,
		ProductOrderField.PublishedAt,
		ProductOrderField.MinimalPrice,
	].map<SelectOption>((value) => ({
		value,
		label: func(
			`common.${value.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`,
		),
	}));
});
