<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Input } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { VoucherChannelListing } from '$lib/gql/graphql';

	type Props = {
		minimumOrderValue?: number;
		minimumQuantityOfItems?: number;
		activeChannelListings: VoucherChannelListing[];
	};

	type RequirementType = 'Minimum order value' | 'Minimum quantity of items' | 'none';

	let {
		minimumOrderValue = $bindable(),
		minimumQuantityOfItems = $bindable(),
		activeChannelListings = $bindable(),
	}: Props = $props();

	let requirementType = $state<RequirementType>('none');

	const REQUIREMENT_TYPES: RequirementType[] = [
		'none',
		'Minimum order value',
		'Minimum quantity of items',
	];

	const MINIMUM_ORDER_VALUE_COLUMNS: TableColumnProps<VoucherChannelListing>[] = [
		{
			title: 'Channel',
			child: channel,
		},
		{
			title: 'Min order price',
			child: price,
		},
	];

	const handleUpdateMinOrderPrice = (index: number, evt: Event) => {
		activeChannelListings = activeChannelListings.map((listing, idx) => {
			if (idx !== index) return listing;
			return {
				...listing,
				minSpent: {
					currency: listing.currency,
					amount: Number((evt.target as HTMLInputElement).value),
				},
			};
		});
	};
</script>

{#snippet channel({ item }: { item: VoucherChannelListing })}
	<Badge text={item.channel.slug} />
{/snippet}

{#snippet price({ item, idx }: { item: VoucherChannelListing; idx: number })}
	<Input
		value={item.minSpent?.amount}
		placeholder="Minimum order value"
		type="number"
		min={0}
		onchange={(evt) => handleUpdateMinOrderPrice(idx, evt)}
	>
		{#snippet action()}
			<span class="text-xs font-semibold text-gray-600">{item.channel.currencyCode}</span>
		{/snippet}
	</Input>
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Minimum requirements</SectionHeader>
	<div class="space-y-2.5 mb-2">
		{#each REQUIREMENT_TYPES as type, idx (idx)}
			<RadioButton label={type} bind:group={requirementType} value={type} />
		{/each}
	</div>

	{#if requirementType === 'Minimum order value'}
		<Table columns={MINIMUM_ORDER_VALUE_COLUMNS} items={activeChannelListings} />
	{:else if requirementType === 'Minimum quantity of items'}
		<Input
			placeholder="Minimum quantity of items"
			type="number"
			min={1}
			bind:value={minimumQuantityOfItems}
		/>
	{/if}
</div>
