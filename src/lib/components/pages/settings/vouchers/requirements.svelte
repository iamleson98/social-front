<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Input } from '$lib/components/ui/Input';
	import type { VoucherChannelListing } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { array, number, object } from 'zod';

	type Props = {
		minimumQuantityOfItems?: number;
		/** for displaying purpose */
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
		!!minimumQuantityOfItems ? 'min_qty_items' : 'min_order_value',
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

	const handleRequirementTypeChange = () => {
		if (requirementType === 'none') {
			minimumQuantityOfItems = undefined;
			activeChannelListings = activeChannelListings.map<VoucherChannelListing>((item) => ({
				...item,
				minSpent: undefined,
			}));
		} else if (requirementType === 'min_qty_items') {
			activeChannelListings = activeChannelListings.map<VoucherChannelListing>((item) => ({
				...item,
				minSpent: undefined,
			}));
			minimumQuantityOfItems = 0;
		} else {
			minimumQuantityOfItems = undefined;
			activeChannelListings = activeChannelListings.map<VoucherChannelListing>((item) => ({
				...item,
				minSpent: item.minSpent
					? item.minSpent
					: {
							currency: item.currency,
							amount: 0,
						},
			}));
		}
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('voucher.minRequirement')}</SectionHeader>
	<div class="space-y-2.5 mb-2">
		{#each REQUIREMENT_TYPES as type, idx (idx)}
			<RadioButton
				label={type.label}
				bind:group={requirementType}
				value={type.value}
				{disabled}
				onchange={handleRequirementTypeChange}
			/>
		{/each}
	</div>

	{#if requirementType === 'min_order_value'}
		<div class="space-y-2">
			<div class="grid grid-cols-2 gap-2 text-sm font-semibold text-gray-600">
				<div>Channel</div>
				<div>Minimum order value</div>
			</div>
			{#each activeChannelListings as listing, idx (idx)}
				<div class="grid grid-cols-2 gap-2">
					<div>
						<Badge text={listing.channel.slug} />
					</div>
					<Input
						value={listing.minSpent?.amount}
						placeholder={$tranFunc('voucher.minOrderPrice')}
						type="number"
						min={0}
						size="sm"
						{disabled}
						inputDebounceOption={{ onInput: (evt) => handleUpdateMinOrderPrice(idx, evt) }}
						onblur={validateOrderValues}
						variant={valueErrors?.fieldErrors?.[idx]?.length ? 'error' : 'info'}
						subText={valueErrors?.fieldErrors?.[idx]?.[0]}
					>
						{#snippet action()}
							<span class="text-xs font-semibold text-gray-600">
								{listing.channel.currencyCode}
							</span>
						{/snippet}
					</Input>
				</div>
			{/each}
		</div>
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
