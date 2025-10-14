import { tranFunc } from '$i18n';
import type { TranslationKey } from '$i18n/types';
import { VoucherTypeEnum } from '$lib/gql/graphql';
import { derived } from 'svelte/store';

export const APPLICATION_TYPES: Record<VoucherTypeEnum, TranslationKey> = {
	[VoucherTypeEnum.EntireOrder]: 'voucher.applyEntireOrder',
	[VoucherTypeEnum.SpecificProduct]: 'voucher.applySpecificPrd',
	[VoucherTypeEnum.Shipping]: 'voucher.discountShip',
};

export type TabName = 'categories' | 'products' | 'collections' | 'variants';
// export const TABS: TabName[] = ['categories', 'products', 'collections', 'variants'];

export const TABS_OPTIONS = derived(tranFunc, func => [
	{
		value: 'categories' satisfies TabName,
		label: func('common.categories'),
		eligibleLabel: func('voucher.eligibleCategories'),
	},
	{
		value: 'products' satisfies TabName,
		label: func('common.products'),
		eligibleLabel: func('voucher.eligiblePrds'),
	},
	{
		value: 'collections' satisfies TabName,
		label: func('common.collections'),
		eligibleLabel: func('voucher.eligibleCollections'),
	},
	{
		value: 'variants' satisfies TabName,
		label: func('common.variants'),
		eligibleLabel: func('voucher.eligibleVariants'),
	},
]);
