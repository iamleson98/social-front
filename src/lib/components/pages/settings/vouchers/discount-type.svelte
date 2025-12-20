<script lang="ts">
	import { T } from '$i18n';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Input, RadioButton } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		DiscountValueTypeEnum,
		type Query,
		type VoucherChannelListing,
		type VoucherChannelListingAddInput,
		type VoucherChannelListingInput,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { difference } from 'es-toolkit';
	import { array, flattenError, number, object } from 'zod';

	type Props = {
		discountType: DiscountValueTypeEnum;
		existingChannelListings?: VoucherChannelListing[];
		voucherChannelListingInput?: VoucherChannelListingInput;
		/** for displaying purpose */
		activeChannelListings: VoucherChannelListing[];
		disabled?: boolean;
		formOk: boolean;
	};

	let {
		discountType = $bindable(),
		voucherChannelListingInput = $bindable({
			addChannels: [],
			removeChannels: [],
		}),
		existingChannelListings = [],
		activeChannelListings = $bindable(),
		disabled,
		formOk = $bindable(true),
	}: Props = $props();

	/** keeps track of channels already in use with voucher */
	const ExistingUsedChannelIDs = existingChannelListings.map((item) => item.channel.id);
	const Max100PercentErr = $T('channel.valueOutOfRange', { min: '0%', max: '100%' });

	const ChannelListingSchema = array(
		object({
			discountValue: number()
				.nonnegative($CommonState.NonNegativeError)
				.refine(
					(value) => {
						if (discountType === DiscountValueTypeEnum.Percentage) return value <= 100;
						return true;
					},
					{ error: Max100PercentErr },
				),
		}),
	).nonempty($CommonState.FieldRequiredError);

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;

	const VOUCHER_TYPES = $derived([
		{
			value: DiscountValueTypeEnum.Fixed,
			label: $T('voucher.discountFixed'),
		},
		{
			value: DiscountValueTypeEnum.Percentage,
			label: $T('voucher.discountPercent'),
		},
		{
			value: DISCOUNT_TYPE_SHIPPING,
			label: $T('voucher.discountShip'),
		},
	]);

	let selectedChannelIds = $state<string[]>(ExistingUsedChannelIDs);
	const SelectedChannelError = $derived(
		!selectedChannelIds.length ? $CommonState.FieldRequiredError : undefined,
	);

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});
	const DiscountValue = $T('voucher.discountValue');

	let discountValueErrors = $state<(string[] | undefined)[]>([]);

	const validate = () => {
		const result = ChannelListingSchema.safeParse(activeChannelListings);
		discountValueErrors = result.success ? [] : flattenError(result.error).fieldErrors;
		formOk = result.success;
	};

	$effect(() => {
		voucherChannelListingInput.addChannels = activeChannelListings.reduce((acc, cur) => {
			if (ExistingUsedChannelIDs.includes(cur.channel.id)) return acc;
			const newItem: VoucherChannelListingAddInput = {
				channelId: cur.channel.id,
				minAmountSpent: cur.minSpent?.amount,
				discountValue: cur.discountValue,
			};
			acc.push(newItem);
			return acc;
		}, [] as VoucherChannelListingAddInput[]);
	});

	const handleChannelsSelectChange = () => {
		const newChannelIds = difference(selectedChannelIds, ExistingUsedChannelIDs);
		const removeChannelIds = difference(ExistingUsedChannelIDs, selectedChannelIds);

		if (newChannelIds.length) {
			const channelsNotSelected = newChannelIds.filter(
				(id) => !activeChannelListings.some((listing) => listing.channel.id === id),
			);

			activeChannelListings = activeChannelListings.concat(
				channelsNotSelected.map<VoucherChannelListing>((id) => {
					const channel = $channelsQuery.data?.channels?.find((channel) => channel.id === id)!;

					return {
						channel,
						minSpent: {
							currency: channel.currencyCode,
							amount: 0,
							fractionalAmount: 0,
							fractionDigits: 0,
						},
						discountValue: 0,
						id: '',
						currency: channel.currencyCode,
					};
				}),
			);
		}

		voucherChannelListingInput.removeChannels = removeChannelIds;
		activeChannelListings = activeChannelListings.filter((listing) =>
			selectedChannelIds.includes(listing.channel.id),
		);
	};
</script>

{#if $channelsQuery.fetching}
	<div class={SitenameCommonClassName}>
		<SelectSkeleton label />
	</div>
{:else if $channelsQuery.error}
	<Alert variant="error" bordered size="sm">
		{$channelsQuery.error.message}
	</Alert>
{:else if $channelsQuery.data}
	<div class={SitenameCommonClassName}>
		<div>
			<SectionHeader>{$T('settings.availability')}</SectionHeader>
			<ChannelSelect
				label={$T('voucher.specifyChan')}
				required
				multiple
				{disabled}
				valueType="id"
				placeholder={$T('voucher.specifyChan')}
				bind:value={selectedChannelIds}
				variant={SelectedChannelError ? 'error' : 'info'}
				subText={SelectedChannelError}
				onchange={handleChannelsSelectChange}
			/>
		</div>

		<div>
			<SectionHeader>{$T('voucher.discountValueType')}</SectionHeader>
			<div class="space-y-1.5">
				{#each VOUCHER_TYPES as type, idx (idx)}
					<RadioButton label={type.label} bind:group={discountType} {disabled} value={type.value} />
				{/each}
			</div>
		</div>

		{#if discountType !== DISCOUNT_TYPE_SHIPPING}
			<div class="space-y-2">
				<SectionHeader>{$T('common.value')}</SectionHeader>
				<div class="grid grid-cols-2 gap-2 text-sm font-semibold text-gray-600">
					<div>{$T('product.channel')}</div>
					<div>{$T('common.value')}</div>
				</div>
				{#each activeChannelListings as listing, idx (idx)}
					<div class="grid grid-cols-2 gap-2">
						<div>
							<Badge text={listing.channel.slug} />
						</div>
						<Input
							bind:value={listing.discountValue}
							placeholder={DiscountValue}
							type="number"
							size="sm"
							min={0}
							{disabled}
							inputDebounceOption={{ onInput: validate }}
							onblur={validate}
							variant={discountValueErrors?.[idx]?.length ? 'error' : 'info'}
							subText={discountValueErrors?.[idx]?.[0]}
						>
							{#snippet action()}
								<span class="text-xs font-semibold text-gray-600">
									{discountType === DiscountValueTypeEnum.Fixed
										? listing.channel.currencyCode
										: '%'}
								</span>
							{/snippet}
						</Input>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
