<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		DiscountValueTypeEnum,
		VoucherTypeEnum,
		type CategoryCountableConnection,
		type CollectionCountableConnection,
		type ProductCountableConnection,
		type ProductVariantCountableConnection,
		type VoucherChannelListing,
	} from '$lib/gql/graphql';
	import VoucherProductApplication from './voucher-product-application.svelte';

	type Props = {
		discountType: DiscountValueTypeEnum;
		channelListings: VoucherChannelListing[];
		applicationType: VoucherTypeEnum;
		applyOncePerOrder: boolean;
		categories?: CategoryCountableConnection | null;
		products?: ProductCountableConnection | null;
		collections?: CollectionCountableConnection | null;
		variants?: ProductVariantCountableConnection | null;
	};

	let {
		discountType,
		channelListings,
		applicationType = $bindable(),
		applyOncePerOrder = $bindable(),
		categories,
		products,
		collections,
		variants,
	}: Props = $props();

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;

	const VOUCHER_TYPES: DiscountValueTypeEnum[] = [
		DiscountValueTypeEnum.Fixed,
		DiscountValueTypeEnum.Percentage,
		DISCOUNT_TYPE_SHIPPING,
	];
	const APPLICATION_TYPES = [VoucherTypeEnum.EntireOrder, VoucherTypeEnum.SpecificProduct];

	const CHANNEL_LISTING_COLUMNS: TableColumnProps<VoucherChannelListing>[] = [
		{
			title: 'Channel',
			child: channel,
		},
		{
			title: 'Price',
			child: price,
		},
	];
</script>

{#snippet channel({ item }: { item: VoucherChannelListing })}
	<Badge text={item.channel.slug} />
{/snippet}

{#snippet price({ item }: { item: VoucherChannelListing })}
	<Input value={item.discountValue} placeholder="Discount value" type="number" min="0">
		{#snippet action()}
			{#if discountType === DiscountValueTypeEnum.Fixed}
				<span class="text-xs font-semibold text-gray-600">{item.channel.currencyCode}</span>
			{:else if discountType === DiscountValueTypeEnum.Percentage}
				<span class="text-xs font-semibold text-gray-600">%</span>
			{/if}
		{/snippet}
	</Input>
{/snippet}

{#if discountType !== DISCOUNT_TYPE_SHIPPING}
	<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
		<div>
			<SectionHeader>Value</SectionHeader>
			<Table columns={CHANNEL_LISTING_COLUMNS} items={channelListings ?? []} />
		</div>

		<div>
			<SectionHeader>Application type</SectionHeader>
			<div class="space-y-2.5">
				{#each APPLICATION_TYPES as type, idx (idx)}
					<RadioButton
						label={type.toLocaleLowerCase().split('_').join(' ')}
						bind:group={applicationType}
						value={type}
					/>
				{/each}

				<Checkbox
					label="Apply only to a single cheapest eligible product"
					subText="If this option is unchecked, discount will be counted for every eligible product"
					bind:checked={applyOncePerOrder}
				/>
			</div>
		</div>
		{#if applicationType === VoucherTypeEnum.SpecificProduct}
			<VoucherProductApplication {categories} {products} {collections} {variants} />
		{/if}
	</div>
{/if}
