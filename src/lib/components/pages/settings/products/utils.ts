import { CHANNELS_QUERY } from '$lib/api/channels';
import { GRAPHQL_CLIENT } from '$lib/api/client';
import type { SelectItemProps } from '$lib/components/ui/MegaMenu/types';
import type { SelectOption } from '$lib/components/ui/select';
import {
	type CategoryCountableConnection,
	type PreorderSettingsInput,
	type ProductVariantChannelListingAddInput,
	type Query,
	type StockInput,
} from '$lib/gql/graphql';
import { checkIfGraphqlResultHasError } from '$lib/utils/utils';


export type CategorySelectItemProps = Omit<SelectItemProps, 'children'> & { children?: CategoryCountableConnection }

export type VariantManifest = {
	attribute: {
		id: string;
		name: string;
	};
	values: SelectOption[];
};

export const PRODUCT_NAME_MAX_LENGTH = 250;
export const PRODUCT_SLUG_MAX_LENGTH = 255;

export type VariantManifestProps = {
	name: {
		value: string;
		error?: string;
	};
	values: {
		value: string;
		error?: string;
	}[];
};

export type CustomStockInput = StockInput & { warehouseName: string };

export type ChannelSelectOptionProps = SelectOption &
	ProductVariantChannelListingAddInput & { currency: string };

export type QuickFillHighlight =
	| 'td-channel-hl'
	| 'td-price-hl'
	| 'td-stock-hl'
	| 'td-sku-hl'
	| 'td-cost-price-hl'
	| 'td-weight-hl'
	| 'td-preorder-hl';

export type QuickFillingProps = {
	channels: ChannelSelectOptionProps[];
	/**
	 * Since channels have associated warehouses, so when channels are updated, we need to update the warehouses
	 */
	stocks: CustomStockInput[];
	sku?: string;
	weight?: number;
	preOrder: PreorderSettingsInput;
	trackInventory: boolean;
	quantityLimitPerCustomer?: number;
};

/**
 * Variants are defined by attributes combination. We keep track of those attributes information within private metadata, using this key.
 * But we won't show the metadata of this key to the UI, the content of this etadata will be handled by fe logic
 */
export const ProductPrivateMetadataVariantAttributeUsedKey = 'variantAttributeUsed';

export const MAX_VARIANT_TYPES = 2;
export const MIN_DAYS_FOR_PREORDER = 5;
export const MAX_DAYS_FOR_PREORDER = 15;

export const calculateStockInputForChannels = async () => {
	const result = await GRAPHQL_CLIENT.query<Pick<Query, 'channels'>>(
		CHANNELS_QUERY,
		{},
		{
			requestPolicy: 'cache-and-network',
		},
	);

	if (checkIfGraphqlResultHasError(result)) return [];

	const warehousesOfChannels: CustomStockInput[] = [];
	const warehouseMeetMap: Record<string, boolean> = {};

	for (const channel of result.data?.channels || []) {
		// if (!channels.includes(channel.id)) continue;

		for (const warehouse of channel.warehouses) {
			if (!warehouseMeetMap[warehouse.id]) {
				warehouseMeetMap[warehouse.id] = true;

				warehousesOfChannels.push({
					warehouse: warehouse.id,
					warehouseName: warehouse.name,
					quantity: 0,
				});
			}
		}
	}

	return warehousesOfChannels;
};

export const calculateTableColumnWidth = (manifests: VariantManifest[]) => {
	if (!manifests.length) return '';
	if (manifests.length === 1) return 'w-[12.5%]!';
	return 'w-[11.11%]!';
};

export const RandomStringLength = 10;
