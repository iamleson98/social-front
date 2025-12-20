<script lang="ts">
	import { T } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import type {
		Channel,
		ShippingMethodChannelListingAddInput,
		ShippingMethodChannelListingInput,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { calculateZodErrors, type PriceErrors, type ZodErrors } from './utils';
	import { difference } from 'es-toolkit';
	import { onMount } from 'svelte';
	import { array, number, object } from 'zod';

	type Props = {
		shippingMethodChannelListingsInput: ShippingMethodChannelListingInput;
		availableChannels: Channel[];
	};

	let { shippingMethodChannelListingsInput = $bindable(), availableChannels }: Props = $props();

	const availableChannelsMap = availableChannels.reduce(
		(acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		},
		{} as Record<string, Channel>,
	);

	let innerAvailableChannelIds = $state(Object.keys(availableChannelsMap));
	const NoChannelError = $derived(
		!innerAvailableChannelIds.length ? $CommonState.FieldRequiredError : undefined,
	);
	let pricingErrors = $state<PriceErrors>({});

	const PriceSchema = array(
		object({
			price: number().nonnegative($CommonState.NonNegativeError),
			minimumOrderPrice: number().nonnegative($CommonState.NonNegativeError),
			maximumOrderPrice: number().nonnegative($CommonState.NonNegativeError),
		}).refine((item) => item.minimumOrderPrice <= item.maximumOrderPrice, {
			message: $T('ship.minPriceLessThanMaxPrice'),
			path: ['minimumOrderPrice'],
		}),
	);

	const validate = () => {
		const result = PriceSchema.safeParse(shippingMethodChannelListingsInput.addChannels);
		pricingErrors = result.success
			? {}
			: calculateZodErrors(result.error.issues as any as ZodErrors);
	};

	const handleChannelsChange = () => {
		let currentChannelPrices = shippingMethodChannelListingsInput.addChannels || [];

		const availableChannelIds = Object.keys(availableChannelsMap);
		const removeChannelIds = difference(availableChannelIds, innerAvailableChannelIds);
		const addChannelIds = difference(
			innerAvailableChannelIds,
			currentChannelPrices.map((item) => item.channelId),
		);

		if (removeChannelIds.length)
			currentChannelPrices = currentChannelPrices?.filter(
				(item) => !removeChannelIds.includes(item.channelId),
			);

		if (addChannelIds.length)
			currentChannelPrices = currentChannelPrices.concat(
				addChannelIds.map((id) => ({
					channelId: id,
					minimumOrderPrice: 0,
					maximumOrderPrice: 0,
					price: 0,
				})),
			);

		shippingMethodChannelListingsInput.addChannels = currentChannelPrices;
		validate();
	};

	onMount(() => {
		shippingMethodChannelListingsInput.addChannels =
			availableChannels.map<ShippingMethodChannelListingAddInput>((chan) => ({
				channelId: chan.id,
				minimumOrderPrice: 0,
				maximumOrderPrice: 0,
				price: 0,
			}));
	});
</script>

{#snippet currencyDisplay(code: string)}
	<span class="text-[10px] font-semibold">{code}</span>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>{$T('ship.distributionAndPrice')}</SectionHeader>

	<Select
		multiple
		label={$T('ship.chansAvailable')}
		options={availableChannels.map((chan) => ({
			value: chan.id,
			label: chan.name,
		}))}
		bind:value={innerAvailableChannelIds}
		onchange={handleChannelsChange}
		required
		variant={NoChannelError ? 'error' : 'info'}
		subText={NoChannelError}
	/>

	<div class="flex gap-2 items-start flex-row font-medium text-sm text-gray-600">
		<div class="flex-1/10">{$T('product.channel')}</div>
		<div class="flex-3/10">{$T('ship.minOrderValue')}</div>
		<div class="flex-3/10">{$T('ship.maxOrderValue')}</div>
		<div class="flex-3/10">{$T('checkout.shippingCost')}</div>
	</div>
	{#each shippingMethodChannelListingsInput.addChannels! as listing, idx (idx)}
		<div class="flex gap-2 items-start flex-row">
			<div class="flex-1/10">{availableChannelsMap[listing.channelId].name}</div>
			<Input
				size="sm"
				placeholder={$T('ship.minOrderValue')}
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
					{@render currencyDisplay(availableChannelsMap[listing.channelId].currencyCode)}
				{/snippet}
			</Input>
			<Input
				size="sm"
				placeholder={$T('ship.maxOrderValue')}
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
					{@render currencyDisplay(availableChannelsMap[listing.channelId].currencyCode)}
				{/snippet}
			</Input>
			<Input
				size="sm"
				placeholder={$T('checkout.shippingCost')}
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
					{@render currencyDisplay(availableChannelsMap[listing.channelId].currencyCode)}
				{/snippet}
			</Input>
		</div>
	{/each}
</div>
