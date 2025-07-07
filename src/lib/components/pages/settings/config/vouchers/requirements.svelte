<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Input } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { VoucherChannelListing } from '$lib/gql/graphql';
	import { array, number, object } from 'zod';

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
			title: 'Channel',
			child: channel,
		},
		{
			title: 'Min order price',
			child: price,
		},
	];

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
		placeholder="Minimum order value"
		type="number"
		min={0}
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
	<SectionHeader>Minimum requirements</SectionHeader>
	<div class="space-y-2.5 mb-2">
		{#each REQUIREMENT_TYPES as type, idx (idx)}
			<RadioButton label={type} bind:group={requirementType} value={type} />
		{/each}
	</div>

	{#if requirementType === 'Minimum order value'}
		<Table columns={MINIMUM_ORDER_VALUE_COLUMNS} items={activeChannelListings} />
	{:else if requirementType === 'Minimum quantity of items'}
		{@const error = typeof minimumQuantityOfItems === 'number' && minimumQuantityOfItems < 0}
		<Input
			placeholder="Minimum quantity of items"
			type="number"
			min={1}
			bind:value={minimumQuantityOfItems}
			variant={error ? 'error' : 'info'}
			subText={error ? NON_NEGATIVE : undefined}
		/>
	{/if}
</div>
