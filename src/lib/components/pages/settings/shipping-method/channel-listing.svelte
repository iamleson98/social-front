<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type {
		ShippingMethodChannelListing,
		ShippingMethodChannelListingInput,
		ShippingMethodChannelListingUpdate,
	} from '$lib/gql/graphql';
	import { classNames, SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		/** if not provided, meaning it is create page */
		shippingMethodChannelListings?: ShippingMethodChannelListing[];
		shippingMethodChannelListingsInput?: ShippingMethodChannelListingInput;
	};

	let { shippingMethodChannelListings = [], shippingMethodChannelListingsInput }: Props = $props();

	let availableChannelIds = $state(shippingMethodChannelListings.map((item) => item.channel.id));

	const PricingColumns: TableColumnProps<ShippingMethodChannelListing>[] = [
		{
			title: 'channel',
			child: channel,
		},
		{
			title: 'min order value',
			child: minOrderValue,
		},
		{
			title: 'max order value',
			child: maxOrderValue,
		},
		{
			title: 'Shipping cost',
			child: shippingCost,
		},
	];
</script>

{#snippet channel({ item }: { item: ShippingMethodChannelListing })}
	<span class="text-xs">{item.channel.name}</span>
{/snippet}

{#snippet shippingCost({ item }: { item: ShippingMethodChannelListing })}
	<Input size="sm" placeholder="min order value" type="number" value={item.price?.amount}>
		{#snippet action()}
			<span class="text-[10px] font-semibold">{item.channel.currencyCode}</span>
		{/snippet}
	</Input>
{/snippet}

{#snippet minOrderValue({ item }: { item: ShippingMethodChannelListing })}
	<Input
		size="sm"
		placeholder="min order value"
		type="number"
		value={item.minimumOrderPrice?.amount}
	>
		{#snippet action()}
			<span class="text-[10px] font-semibold">{item.channel.currencyCode}</span>
		{/snippet}
	</Input>
{/snippet}

{#snippet maxOrderValue({ item }: { item: ShippingMethodChannelListing })}
	<Input
		size="sm"
		placeholder="max order value"
		type="number"
		value={item.maximumOrderPrice?.amount}
	>
		{#snippet action()}
			<span class="text-[10px] font-medium">{item.channel.currencyCode}</span>
		{/snippet}
	</Input>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>Distribution and Pricing</SectionHeader>

	<ChannelSelect
		multiple
		label="Channels available"
		placeholder="channels available"
		valueType="id"
		bind:value={availableChannelIds}
		required
	/>

	<Table items={shippingMethodChannelListings} columns={PricingColumns} />
</div>
