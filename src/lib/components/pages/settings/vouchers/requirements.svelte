<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Input } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { VoucherChannelListing } from '$lib/gql/graphql';
	import { untrack } from 'svelte';
	import { array, number, object } from 'zod';

	type Props = {
		minimumQuantityOfItems?: number;
		activeChannelListings: VoucherChannelListing[];
		disabled?: boolean;
	};

	type RequirementType = 'min_order_value' | 'min_qty_items' | 'none';

	let {
		minimumQuantityOfItems = $bindable(),
		activeChannelListings = $bindable(),
		disabled,
	}: Props = $props();

	let requirementType = $state<RequirementType>(
		typeof minimumQuantityOfItems === 'number' ? 'min_qty_items' : 'min_order_value',
	);

	const REQUIREMENT_TYPES: { value: RequirementType; label: string }[] = [
		{
			value: 'none',
			label: $tranFunc('common.no'),
		},
		{
			value: 'min_order_value',
			label: $tranFunc('voucher.minOrderPrice'),
		},
		{
			value: 'min_qty_items',
			label: $tranFunc('voucher.minQtyItems'),
		},
	];

	const NON_NEGATIVE = $tranFunc('error.negativeNumber');

	const ValueSchema = array(
		object({
			minSpent: object({
				amount: number().nonnegative(NON_NEGATIVE),
			}),
		}),
	);

	let valueErrors = $state<{
		formErrors?: string[];
		fieldErrors?: Record<number, string[]>;
	}>();

	const MINIMUM_ORDER_VALUE_COLUMNS: TableColumnProps<VoucherChannelListing>[] = [
		{
			title: $tranFunc('product.channel'),
			child: channel,
		},
		{
			title: $tranFunc('voucher.minOrderPrice'),
			child: price,
		},
	];

	$effect(() => {
		// If no requirement, then we must set those value to nothing
		untrack(() => minimumQuantityOfItems);

		if (requirementType === 'none') {
			minimumQuantityOfItems = undefined;
			activeChannelListings = [];
		} else if (requirementType === 'min_order_value') {
			minimumQuantityOfItems = undefined;
			activeChannelListings = untrack(() => activeChannelListings);
		} else if (requirementType === 'min_qty_items') {
			activeChannelListings = [];
		}
	});

	const validateOrderValues = () => {
		const result = ValueSchema.safeParse(activeChannelListings);
		valueErrors = result.error?.formErrors as any;
	};

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

		validateOrderValues();
	};
</script>

{#snippet channel({ item }: { item: VoucherChannelListing })}
	<Badge text={item.channel.slug} />
{/snippet}

{#snippet price({ item, idx }: { item: VoucherChannelListing; idx: number })}
	<Input
		value={item.minSpent?.amount}
		placeholder={$tranFunc('voucher.minOrderPrice')}
		type="number"
		min={0}
		{disabled}
		inputDebounceOption={{ onInput: (evt) => handleUpdateMinOrderPrice(idx, evt) }}
		onblur={validateOrderValues}
		variant={valueErrors?.fieldErrors?.[idx]?.length ? 'error' : 'info'}
		subText={valueErrors?.fieldErrors?.[idx]?.[0]}
	>
		{#snippet action()}
			<span class="text-xs font-semibold text-gray-600">{item.channel.currencyCode}</span>
		{/snippet}
	</Input>
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>{$tranFunc('voucher.minRequirement')}</SectionHeader>
	<div class="space-y-2.5 mb-2">
		{#each REQUIREMENT_TYPES as type, idx (idx)}
			<RadioButton label={type.label} bind:group={requirementType} value={type.value} {disabled} />
		{/each}
	</div>

	{#if requirementType === 'min_order_value'}
		<Table columns={MINIMUM_ORDER_VALUE_COLUMNS} items={activeChannelListings} {disabled} />
	{:else if requirementType === 'min_qty_items'}
		{@const error = typeof minimumQuantityOfItems === 'number' && minimumQuantityOfItems < 0}
		<Input
			placeholder={$tranFunc('voucher.minQtyItems')}
			type="number"
			min={1}
			{disabled}
			bind:value={minimumQuantityOfItems}
			variant={error ? 'error' : 'info'}
			subText={error ? NON_NEGATIVE : undefined}
		/>
	{/if}
</div>
