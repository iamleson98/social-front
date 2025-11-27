<script lang="ts" module>
	// defined as const to make it easier to use
	export const ExistingKey = 'existing' as keyof ProductVariantChannelListingUpdateInput;

	export const CurrentKey = 'current' as keyof ProductVariantChannelListingUpdateInput;
</script>

<script lang="ts">
	import { tranFunc } from '$i18n';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton } from '$lib/components/ui/select';
	import {
		type MetadataInput,
		type ProductChannelListingAddInput,
		type ProductChannelListingUpdateInput,
		type ProductVariantBulkUpdateInput,
		type ProductVariantChannelListing,
		type ProductVariantChannelListingAddInput,
		type ProductVariantChannelListingUpdateInput,
		type StockInput,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import type { ChannelSelectOptionProps, QuickFillingProps, VariantManifest } from './utils';
	import dayjs from 'dayjs';
	import { difference } from 'es-toolkit';
	import { onMount } from 'svelte';

	type Props = {
		disabled?: boolean;
		/** This is provided by the channel listing selector section */
		channelsListing: ProductChannelListingUpdateInput;
		productVariantsInput: ProductVariantBulkUpdateInput[];
		privateMetadata: MetadataInput[];
	};

	let {
		disabled,
		productVariantsInput = $bindable(),
		privateMetadata = $bindable(),
		channelsListing,
	}: Props = $props();

	let variantManifests = $state<VariantManifest[]>([]);
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true,
	});

	const MAX_VARIANT_TYPES = 2;
	const MIN_DAYS_FOR_PREORDER = 5;
	const MAX_DAYS_FOR_PREORDER = 15;
	const DAYJS_NOW = dayjs();

	// initially
	onMount(() => {});

	$effect(() => {
		// when the given channels change, this function runs again,
		// we must do these steps below, to make sure the logic works:

		// 1) Update the logic for the channel select options
		const newChannelSelectOptions: ChannelSelectOptionProps[] = [];
		const channelIdsMap: Record<string, boolean> = {};

		channelsListing?.updateChannels?.forEach((channelListing) => {
			newChannelSelectOptions.push({
				value: channelListing.channelId,
				label: channelListing['channelName' as keyof ProductChannelListingAddInput],
				currency: channelListing['currency' as keyof ProductChannelListingAddInput],
				channelId: channelListing.channelId,
				price: undefined,
			});

			channelIdsMap[channelListing.channelId] = true;
		});

		channelSelectOptions = newChannelSelectOptions;

		if (quickFillingValues.channels.some((chan) => !channelIdsMap[chan.channelId]))
			// 2) In case user already selected channels for some variant(s),
			// we must check and keep them in sync with new selected channels.

			// a) quick filling section
			quickFillingValues.channels = quickFillingValues.channels.filter(
				(chan) => channelIdsMap[chan.channelId],
			);

		// if (
		// 	variantsInputDetails.some((inputDetail) =>
		// 		inputDetail.channelListings?.some((listing) => !channelIdsMap[listing.channelId]),
		// 	)
		// )
		// 	// b) variant detail sections
		// 	variantsInputDetails = variantsInputDetails.map((inputDetail) => {
		// 		inputDetail.channelListings = inputDetail.channelListings?.filter(
		// 			(chan) => channelIdsMap[chan.channelId],
		// 		);

		// 		return inputDetail;
		// 	});
	});

	/**
	 * If there is 1 variant, there will be 8 columns -> each column's width = 1/9 = 11.11%, 2 variants -> 9 columns -> each column's width = 1/8 = 12.5%;
	 */
	const ThClass = $derived.by(() => {
		if (!variantManifests.length) return '';
		if (variantManifests.length === 1) return 'w-[12.5%]!';
		return 'w-[11.11%]!';
	});
</script>

<div class={SitenameCommonClassName}>
	<table class="w-full text-sm h-fit text-left table text-gray-600">
		<thead>
			<tr>
				<th class={ThClass}>{variantManifests[0].attribute.name}</th>
				{#if variantManifests.length === MAX_VARIANT_TYPES}
					<th class={ThClass}>{variantManifests[1].attribute.name}</th>
				{/if}
				<th class={ThClass}>{$tranFunc('product.channel')}</th>
				<th class={ThClass}>{$tranFunc('product.price')}</th>
				<th class={ThClass}>{$tranFunc('product.costPrice')}</th>
				<th class={ThClass}>{$tranFunc('attributes.Weight')}</th>
				<th class={ThClass}>{$tranFunc('common.preorder')}</th>
				<th class={ThClass}>{$tranFunc('product.stock')}</th>
				<th class={ThClass}>{$tranFunc('product.sku')}</th>
			</tr>
		</thead>
		<tbody>
			{#each productVariantsInput as variantInputDetail, detailIdx (detailIdx)}
				<tr class={`variant-table-row border-b border-gray-200`}>
					{#if variantManifests.length === MAX_VARIANT_TYPES}
						{#if detailIdx % variantManifests[1].values.length === 0}
							<td
								class={['text-center font-medium text-blue-600 bg-blue-50']}
								rowspan={variantManifests[1].values.length}
							>
								{variantInputDetail.name?.split('-')[0]}
							</td>
						{/if}
						<td class="text-center">{variantInputDetail.name?.split('-')[1]}</td>
					{:else}
						<td class="text-center">
							<dir>{variantInputDetail.name?.split('-')[0]}</dir>
						</td>
					{/if}
					<!-- CHANNELS -->
					<td class="channel-td max-w-3xs min-w-28">
						{#if !channelSelectOptions?.length}
							<SelectSkeleton size="sm" />
						{:else}
							{@const currentChannelIds =
								variantInputDetail.channelListings?.[CurrentKey]?.map(
									(item) => (item as any).channel.id,
								) || []}
							{@const existingChannelIds = variantInputDetail.channelListings?.[
								ExistingKey
							] as string[]}
							<Select
								size="sm"
								{disabled}
								options={channelSelectOptions}
								value={currentChannelIds}
								multiple
								onchange={(opts) => {
									const selectedChannelIds =
										!opts || !Array.isArray(opts) || !opts.length
											? []
											: opts.map((opt) => opt.value);

									const newChannelIds = difference(
										selectedChannelIds,
										existingChannelIds,
									) as string[];
									const removeChannelIds = difference(
										existingChannelIds,
										selectedChannelIds,
									) as string[];

									if (removeChannelIds)
										variantInputDetail.channelListings!.remove = removeChannelIds;
									if (newChannelIds) {
										variantInputDetail.channelListings!.create =
											newChannelIds.map<ProductVariantChannelListingAddInput>((id) => ({
												channelId: id,
												price: 0,
											}));
									}
								}}
							/>
						{/if}
					</td>
					<!-- PRICE -->
					<td class="price-td">
						<div class="space-y-1">
							{#each variantInputDetail.channelListings?.[CurrentKey] as unknown as ProductVariantChannelListing[] as channelListing, idx (idx)}
								<Input
									type="number"
									min={0}
									{disabled}
									size="xs"
									placeholder={channelListing.price?.currency || channelListing.costPrice?.currency}
									bind:value={variantInputDetail.channelListings![idx].price}
									variant={channelListing.price < 0 ? 'error' : 'info'}
									subText={typeof channelListing.price === 'number' && channelListing.price < 0
										? $CommonState.NonNegativeError
										: ''}
								></Input>
							{/each}
						</div>
					</td>
					<!-- COST PRICE -->
					<td class="cost-price-td">
						<div class="space-y-1">
							{#each variantInputDetail.channelListings || [] as channelListing, idx (idx)}
								<Input
									type="number"
									min={0}
									{disabled}
									size="xs"
									placeholder={channelListing[
										'currency' as keyof ProductVariantChannelListingAddInput
									]}
									bind:value={variantInputDetail.channelListings![idx].costPrice}
									variant={channelListing.costPrice < 0 ? 'error' : 'info'}
									subText={typeof channelListing.costPrice === 'number' &&
									channelListing.costPrice < 0
										? $CommonState.NonNegativeError
										: ''}
								></Input>
							{/each}
						</div>
					</td>
					<!-- WEIGHT -->
					<td class="weight-td">
						<Input
							type="number"
							size="sm"
							min={0}
							placeholder="kg"
							{disabled}
							bind:value={variantInputDetail.weight}
							variant={variantInputDetail.weight >= 0 ? 'info' : 'error'}
							subText={variantInputDetail.weight >= 0 ? '' : $CommonState.NonNegativeError}
						>
							{#snippet action()}
								<span class="text-[8px] font-semibold">kg</span>
							{/snippet}
						</Input>
					</td>
					<!-- PREORDER -->
					<td class="preorder-td">
						<Input
							type="number"
							min={0}
							label={$tranFunc('product.qtyLimit')}
							size="xs"
							class="mb-2"
							{disabled}
							bind:value={variantInputDetail.preorder!.globalThreshold}
							variant={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
							variantInputDetail.preorder.globalThreshold % 1 !== 0
								? 'error'
								: 'info'}
							subText={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
							variantInputDetail.preorder.globalThreshold % 1 !== 0
								? $CommonState.NonNegativeError
								: undefined}
						/>
						<EaseDatePicker
							size="xs"
							label={$tranFunc('product.preOrderEndDate')}
							allowSelectMonthYears={{
								showMonths: true,
								showYears: { min: 2020, max: DAYJS_NOW.year() + 1 },
							}}
							{disabled}
							timeConfig={false}
							onchange={(date) => (variantInputDetail.preorder!.endDate = date.date)}
							value={{ date: variantInputDetail.preorder!.endDate }}
							class="mb-2"
							timeLock={{
								minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
								maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate(),
							}}
						/>
					</td>
					<!-- STOCK -->
					<td class="stock-td">
						<div class="space-y-1 max-h-28 overflow-y-auto p-0.5">
							{#each variantInputDetail.stocks || [] as stock, idx (idx)}
								<Input
									size="xs"
									label={stock['warehouseName' as keyof StockInput] as string}
									placeholder={$tranFunc('product.stock')}
									bind:value={variantInputDetail.stocks![idx].quantity}
									type="number"
									{disabled}
									min={0}
									variant={stock.quantity % 1 !== 0 ? 'error' : 'info'}
									subText={stock.quantity % 1 !== 0 ? $CommonState.NonNegativeError : ''}
								/>
							{/each}
						</div>
					</td>
					<!-- SKU -->
					<td class="sku-td">
						<Input
							type="text"
							size="sm"
							{disabled}
							placeholder="SKU"
							bind:value={variantInputDetail.sku}
							variant={variantInputDetail.sku?.trim() ? 'info' : 'error'}
							subText={variantInputDetail.sku?.trim() ? '' : $CommonState.FieldRequiredError}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
