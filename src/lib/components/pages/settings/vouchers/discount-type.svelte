<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Input, RadioButton } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		DiscountValueTypeEnum,
		type Query,
		type VoucherChannelListing,
		type VoucherChannelListingInput,
	} from '$lib/gql/graphql';
	import { difference } from 'es-toolkit';
	import { array, number, object } from 'zod';

	type Props = {
		discountType: DiscountValueTypeEnum;
		existingChannelListings: VoucherChannelListing[];
		voucherChannelListingInput: VoucherChannelListingInput;
		activeChannelListings: VoucherChannelListing[];
		disabled?: boolean;
	};

	let {
		discountType = $bindable(),
		voucherChannelListingInput = $bindable({
			addChannels: [],
			removeChannels: [],
		}),
		existingChannelListings,
		activeChannelListings = $bindable(),
		disabled,
	}: Props = $props();

	/** keeps track of channels already in use with voucher */
	const existingUsedChannelIDs = existingChannelListings.reduce(
		(acc, cur) => acc.concat(cur.channel.id),
		[] as string[],
	);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const NON_NEGATIVE = $tranFunc('error.negativeNumber');

	const ChannelListingSchema = array(
		object({
			discountValue: number().nonnegative(NON_NEGATIVE),
		}),
	).nonempty(REQUIRED_ERROR);

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;

	const VOUCHER_TYPES: DiscountValueTypeEnum[] = [
		DiscountValueTypeEnum.Fixed,
		DiscountValueTypeEnum.Percentage,
		DISCOUNT_TYPE_SHIPPING,
	];

	let selectedChannelIds = $state<string[]>(existingUsedChannelIDs);

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

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
	});

	let discountValueErrors = $state<{
		formErrors?: string[];
		fieldErrors?: Record<number, string[]>;
	}>();

	const validate = () => {
		const result = ChannelListingSchema.safeParse(activeChannelListings);
		discountValueErrors = result.error?.formErrors as any;
	};

	const handleChannelsChange = () => {
		const newChannelIds = difference(selectedChannelIds, existingUsedChannelIDs);
		const removeChannelIds = difference(existingUsedChannelIDs, selectedChannelIds);

		voucherChannelListingInput.addChannels = newChannelIds.map((id) => ({
			channelId: id,
			discountValue: 0,
			minAmountSpent: 0,
		}));
		voucherChannelListingInput.removeChannels = removeChannelIds;

		activeChannelListings = existingChannelListings.concat(
			newChannelIds.map((id) => {
				const channel = $channelsQuery.data?.channels?.find((item) => item.id === id)!;

				return {
					channel,
					currency: channel.currencyCode,
					discountValue: 0,
					id: '',
					minSpent: {
						currency: channel.currencyCode,
						amount: 0,
					},
				};
			}),
		);

		activeChannelListings = activeChannelListings.filter(
			(item) => !removeChannelIds.includes(item.channel.id),
		);

		validate();
	};

	const handleDiscountAmountChange = (index: number, evt: Event) => {
		activeChannelListings = activeChannelListings.map((listing, idx) => {
			if (idx !== index) return listing;

			return {
				...listing,
				discountValue: Number((evt.target as HTMLInputElement).value),
			};
		});

		validate();
	};
</script>

{#snippet channel({ item }: { item: VoucherChannelListing })}
	<Badge text={item.channel.slug} />
{/snippet}

{#snippet price({ item, idx }: { item: VoucherChannelListing; idx: number })}
	<Input
		value={item.discountValue}
		placeholder="Discount value"
		type="number"
		min={0}
		{disabled}
		inputDebounceOption={{ onInput: (evt) => handleDiscountAmountChange(idx, evt) }}
		onblur={validate}
		variant={discountValueErrors?.fieldErrors?.[idx]?.length ? 'error' : 'info'}
		subText={discountValueErrors?.fieldErrors?.[idx]?.[0]}
	>
		{#snippet action()}
			<span class="text-xs font-semibold text-gray-600">
				{discountType === DiscountValueTypeEnum.Fixed ? item.channel.currencyCode : '%'}
			</span>
		{/snippet}
	</Input>
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<div>
		<SectionHeader>Availability</SectionHeader>
		{#if $channelsQuery.fetching}
			<SelectSkeleton size="sm" label />
		{:else if $channelsQuery.error}
			<Alert size="sm" variant="error" bordered>{$channelsQuery.error.message}</Alert>
		{:else if $channelsQuery.data?.channels}
			{@const options = $channelsQuery.data.channels.map<SelectOption>((chan) => ({
				value: chan.id,
				label: chan.name,
			}))}
			<Select
				label="Specify channels"
				required
				multiple
				{disabled}
				{options}
				placeholder="Specify channels"
				bind:value={selectedChannelIds}
				onchange={handleChannelsChange}
				onblur={validate}
				variant={discountValueErrors?.formErrors?.length ? 'error' : 'info'}
				subText={discountValueErrors?.formErrors?.[0]}
			/>
		{/if}
	</div>

	<div>
		<SectionHeader>Discount value type</SectionHeader>
		<div class="space-y-2.5">
			{#each VOUCHER_TYPES as type, idx (idx)}
				<RadioButton
					label={type.toLocaleLowerCase().split('_').join(' ')}
					bind:group={discountType}
					{disabled}
					value={type}
				/>
			{/each}
		</div>
	</div>

	{#if discountType !== DISCOUNT_TYPE_SHIPPING}
		<div>
			<SectionHeader>Value</SectionHeader>
			<Table {disabled} columns={CHANNEL_LISTING_COLUMNS} items={activeChannelListings} />
		</div>
	{/if}
</div>
