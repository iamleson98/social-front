<script lang="ts">
	import { tranFunc } from '$i18n';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type {
		Channel,
		ShippingMethodChannelListing,
		ShippingMethodChannelListingAddInput,
		ShippingMethodChannelListingInput,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { difference, differenceBy } from 'es-toolkit';
	import { onMount } from 'svelte';
	import z, { array, number, object } from 'zod';

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
	const FieldRequiredErr = $tranFunc('helpText.fieldRequired');
	const NonNegativeErr = $tranFunc('error.negativeNumber');
	const NoChannelError = $derived(!innerAvailableChannelIds.length ? FieldRequiredErr : undefined);

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

	type FieldName = 'price' | 'minimumOrderPrice' | 'maximumOrderPrice';

	/**
	 * type returned by zod
	 */
	type Errors = { message: string; path: [number, FieldName] }[];

	type PriceErrors = Record<number, Record<FieldName, string>>;

	const calculateZodErrors = (errs: Errors): PriceErrors => {
		const result: PriceErrors = {};
		for (const err of errs) {
			if (!result[err.path[0]]) result[err.path[0] as number] = {} as Record<FieldName, string>;
			result[err.path[0]][err.path[1] as FieldName] = err.message;
		}

		return result;
	};

	let pricingErrors = $state<PriceErrors>({});

	const validate = () => {
		const result = PriceSchema.safeParse(shippingMethodChannelListingsInput.addChannels);
		pricingErrors = result.success
			? {}
			: calculateZodErrors(result.error?.errors as unknown as Errors);
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
	<SectionHeader>Distribution and Pricing</SectionHeader>

	<Select
		multiple
		label="Channels available"
		placeholder="channels available"
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

	<!-- <Table items={shippingMethodChannelListingsInput.addChannels!} columns={PricingColumns} /> -->
	<div class="flex gap-2 items-start flex-row font-medium text-sm text-gray-600">
		<div class="flex-1/10">Channel</div>
		<div class="flex-3/10">Min order value</div>
		<div class="flex-3/10">Max order value</div>
		<div class="flex-3/10">Shipping cost</div>
	</div>
	{#each shippingMethodChannelListingsInput.addChannels! as listing, idx (idx)}
		<div class="flex gap-2 items-start flex-row">
			<div class="flex-1/10">{availableChannelsMap[listing.channelId].name}</div>
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
					{@render currencyDisplay(availableChannelsMap[listing.channelId].currencyCode)}
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
					{@render currencyDisplay(availableChannelsMap[listing.channelId].currencyCode)}
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
					{@render currencyDisplay(availableChannelsMap[listing.channelId].currencyCode)}
				{/snippet}
			</Input>
		</div>
	{/each}
</div>
