<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import type {
		Channel,
		ShippingMethodChannelListing,
		ShippingMethodChannelListingInput,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { array, number, object } from 'zod';
	import { calculateZodErrors, type PriceErrors, type ZodErrors } from './utils';

	type Props = {
		shippingMethodChannelListings: ShippingMethodChannelListing[];
		shippingMethodChannelListingsInput: ShippingMethodChannelListingInput;
		/** all channels that the shipping zone have, all child shipping methods should at most appear in those channels only */
		availableChannels: Channel[];
	};

	let {
		shippingMethodChannelListings,
		shippingMethodChannelListingsInput = $bindable(),
		availableChannels,
	}: Props = $props();

	const AvailableChannelsMap = availableChannels.reduce(
		(acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		},
		{} as Record<string, Channel>,
	);

	let innerAvailableChannelIds = $state(
		shippingMethodChannelListings.map((item) => item.channel.id),
	);
	const FieldRequiredErr = $tranFunc('helpText.fieldRequired');
	const NonNegativeErr = $tranFunc('error.negativeNumber');
	const NoChannelError = $derived(!innerAvailableChannelIds.length ? FieldRequiredErr : undefined);
	let pricingErrors = $state<PriceErrors>({});

	const PriceSchema = array(
		object({
			price: number().nonnegative(NonNegativeErr),
			minimumOrderPrice: number().nonnegative(NonNegativeErr),
			maximumOrderPrice: number().nonnegative(NonNegativeErr),
		}).refine((item) => item.minimumOrderPrice <= item.maximumOrderPrice, {
			message: 'min price >= max price',
			path: ['minimumOrderPrice'],
		}),
	);

	const validate = () => {
		const result = PriceSchema.safeParse(shippingMethodChannelListingsInput.addChannels);
		pricingErrors = result.success
			? {}
			: calculateZodErrors(result.error?.errors as unknown as ZodErrors);
	};

	// const PricingColumns: TableColumnProps<ShippingMethodChannelListing>[] = [
	// 	{
	// 		title: 'channel',
	// 		child: channel,
	// 	},
	// 	{
	// 		title: 'min order value',
	// 		child: minOrderValue,
	// 	},
	// 	{
	// 		title: 'max order value',
	// 		child: maxOrderValue,
	// 	},
	// 	{
	// 		title: 'Shipping cost',
	// 		child: shippingCost,
	// 	},
	// ];
</script>

<!-- {#snippet channel({ item }: { item: ShippingMethodChannelListing })}
	<span class="text-xs">{item.channel.name}</span>
{/snippet} -->

{#snippet currencyDisplay(code: string)}
	<span class="text-[10px] font-semibold">{code}</span>
{/snippet}

<!-- {#snippet shippingCost({ item }: { item: ShippingMethodChannelListing })}
	<Input size="sm" placeholder="min order value" type="number" value={item.price?.amount}>
		{#snippet action()}
			{@render currencyDisplay(item.channel.currencyCode)}
		{/snippet}
	</Input>
{/snippet} -->

<!-- {#snippet minOrderValue({ item }: { item: ShippingMethodChannelListing })}
	<Input
		size="sm"
		placeholder="min order value"
		type="number"
		value={item.minimumOrderPrice?.amount}
	>
		{#snippet action()}
			{@render currencyDisplay(item.channel.currencyCode)}
		{/snippet}
	</Input>
{/snippet} -->

<!-- {#snippet maxOrderValue({ item }: { item: ShippingMethodChannelListing })}
	<Input
		size="sm"
		placeholder="max order value"
		type="number"
		value={item.maximumOrderPrice?.amount}
	>
		{#snippet action()}
			{@render currencyDisplay(item.channel.currencyCode)}
		{/snippet}
	</Input>
{/snippet} -->

<div class={SitenameCommonClassName}>
	<SectionHeader>Distribution and Pricing</SectionHeader>
	<Select
		options={availableChannels.map((chan) => ({
			value: chan.id,
			label: chan.name,
		}))}
		multiple
		label="Channels available"
		placeholder="channels available"
		bind:value={innerAvailableChannelIds}
		required
		variant={NoChannelError ? 'error' : 'info'}
		subText={NoChannelError}
	/>

	<div class="flex gap-2 items-start flex-row font-medium text-sm text-gray-600">
		<div class="flex-1/10">Channel</div>
		<div class="flex-3/10">Min order value</div>
		<div class="flex-3/10">Max order value</div>
		<div class="flex-3/10">Shipping cost</div>
	</div>

	{#each shippingMethodChannelListings as listing, idx (idx)}
		<div class="flex gap-2 items-start flex-row">
			<div class="flex-1/10">{listing.channel.name}</div>
			<Input
				size="sm"
				placeholder="min order value"
				type="number"
				class="flex-3/10"
				bind:value={listing.minimumOrderPrice}
				min={0}
				onblur={validate}
				inputDebounceOption={{
					onInput: validate,
				}}
				variant={pricingErrors[idx]?.minimumOrderPrice ? 'error' : 'info'}
				subText={pricingErrors[idx]?.minimumOrderPrice}
			>
				{#snippet action()}
					{@render currencyDisplay(AvailableChannelsMap[listing.channel.id].currencyCode)}
				{/snippet}
			</Input>
			<Input
				size="sm"
				placeholder="max order value"
				type="number"
				class="flex-3/10"
				bind:value={listing.maximumOrderPrice}
				min={0}
				onblur={validate}
				inputDebounceOption={{
					onInput: validate,
				}}
				variant={pricingErrors[idx]?.maximumOrderPrice ? 'error' : 'info'}
				subText={pricingErrors[idx]?.maximumOrderPrice}
			>
				{#snippet action()}
					{@render currencyDisplay(AvailableChannelsMap[listing.channel.id].currencyCode)}
				{/snippet}
			</Input>
			<Input
				size="sm"
				placeholder="shipping cost"
				type="number"
				class="flex-3/10"
				bind:value={listing.price}
				min={0}
				onblur={validate}
				inputDebounceOption={{
					onInput: validate,
				}}
				variant={pricingErrors[idx]?.price ? 'error' : 'info'}
				subText={pricingErrors[idx]?.price}
			>
				{#snippet action()}
					{@render currencyDisplay(AvailableChannelsMap[listing.channel.id].currencyCode)}
				{/snippet}
			</Input>
		</div>
	{/each}
</div>
