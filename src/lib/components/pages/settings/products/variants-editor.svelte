<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Badge } from '$lib/components/ui/Badge';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton } from '$lib/components/ui/select';
	import {
		type BulkAttributeValueInput,
		type MetadataInput,
		type ProductChannelListingAddInput,
		type ProductChannelListingUpdateInput,
		type ProductVariantBulkCreateInput,
		type ProductVariantChannelListingAddInput,
		type StockInput,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { randomString, SitenameCommonClassName } from '$lib/utils/utils';
	import { VariantMediaSnippets } from './snippets.svelte';
	import './table.css';
	import {
		calculateStockInputForChannels,
		calculateTableColumnWidth,
		MAX_DAYS_FOR_PREORDER,
		MAX_VARIANT_TYPES,
		MIN_DAYS_FOR_PREORDER,
		RandomStringLength,
		type ChannelSelectOptionProps,
		type CustomStockInput,
		type QuickFillHighlight,
		type QuickFillingProps,
		type VariantManifest,
		type VariantMedia,
	} from './utils';
	import VariantManifests from './variant-manifests.svelte';
	import VariantQuickFillingValues from './variant-quick-filling-values.svelte';
	import dayjs from 'dayjs';
	import { omit } from 'es-toolkit';
	import { set } from 'es-toolkit/compat';
	import { onMount } from 'svelte';

	type Props = {
		productTypeId: string;
		/** This is provided by the channel listing selector section */
		channelsListing: ProductChannelListingUpdateInput;
		disabled?: boolean;
		/** A variant can have 1 media, inherit from its parent */
		productMedias: MediaObject[];
		productVariantsInput: ProductVariantBulkCreateInput[];
		privateMetadata: MetadataInput[];
		productVariantsMediaMap: VariantMedia;
	};

	let {
		productTypeId,
		channelsListing,
		disabled,
		productVariantsInput = $bindable([]),
		privateMetadata = $bindable(),
		productMedias,
		productVariantsMediaMap = $bindable(),
	}: Props = $props();

	const WarehouseNameKey = 'warehouseName' as keyof StockInput;

	const DAYJS_NOW = dayjs();

	let manifestEditor = $state<ReturnType<typeof VariantManifests>>();
	let variantManifests = $state<VariantManifest[]>([]);
	let quickFillingHighlightClass = $state<QuickFillHighlight>();
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	let currentVariantSkuToAssignMedia = $state<string>();
	/**
	 * there are at most 2 attributes used for variants creation, so this list has 2 booleans.
	 * If user can not find her desired attribute values, we support auto create feature,
	 * so user do not have to visit the attribute detail page to add more values.
	 *
	 * With that said, after an attribute value is added, we must use this list, to trigger according select to refetch and find for created attribute values.
	 */
	// let manifestPerformFetchingAttributeValues = $state([false, false]);
	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>(productVariantsInput);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true,
	});
	let customStockInputs = $state<CustomStockInput[]>([]);
	onMount(async () => {
		calculateStockInputForChannels().then((value) => (customStockInputs = value));
	});

	/**
	 * If there is 1 variant, there will be 8 columns -> each column's width = 1/9 = 11.11%, 2 variants -> 9 columns -> each column's width = 1/8 = 12.5%;
	 */
	const ThClass = $derived.by(() => calculateTableColumnWidth(variantManifests));

	const onVariantValuesChange = () => {
		if (variantManifests.length === 1) {
			variantsInputDetails = variantManifests[0].values.map<ProductVariantBulkCreateInput>(
				(attrValue) => {
					// check if there is some variant with those attribute values, already existed
					// If there is, return it as is. (no need to recreate)
					const variantWithAttrValueExisted = variantsInputDetails.find((variantDetail) =>
						variantDetail.attributes.some(
							(attrInput) =>
								attrInput.dropdown?.id === attrValue.value ||
								attrInput.swatch?.id === attrValue.value,
						),
					);

					if (variantWithAttrValueExisted) return variantWithAttrValueExisted;

					const isSwatchAttribute = manifestEditor?.checkAttributeIsSwatch(
						variantManifests[0].attribute.id,
					);

					const attributeProp: BulkAttributeValueInput = {
						id: variantManifests[0].attribute.id,
					};

					set(attributeProp, isSwatchAttribute ? 'swatch.id' : 'dropdown.id', attrValue.value);

					return {
						attributes: [attributeProp],
						name: `${attrValue.label}`,
						sku: `${attrValue.label}-${randomString(RandomStringLength)}`,
						trackInventory: true,
						channelListings: [],
						weight: 0,
						preorder: {},
						stocks: customStockInputs,
					} as ProductVariantBulkCreateInput;
				},
			);
		} else {
			const newVariantDetails = [];

			for (const value1 of variantManifests[0].values) {
				for (const value2 of variantManifests[1].values) {
					// Check if a variant that already has 2 selected attributes.
					// And also has according 1 attribute value for each attribute.
					const existingVariant = variantsInputDetails.find((variantDetail) => {
						if (variantDetail.attributes.length < 2) return false;

						let value1Used = false,
							value2Used = false;

						for (const attr of variantDetail.attributes) {
							if ([attr.dropdown?.id, attr.swatch?.id].includes(value1.value as any))
								value1Used = true;
							else if ([attr.dropdown?.id, attr.swatch?.id].includes(value2.value as any))
								value2Used = true;
						}

						return value1Used && value2Used;
					});

					if (existingVariant) {
						newVariantDetails.push(existingVariant);
						continue;
					}

					const attr1: BulkAttributeValueInput = set(
						{
							id: variantManifests[0].attribute.id,
						},
						manifestEditor?.checkAttributeIsSwatch(variantManifests[0].attribute.id)
							? 'swatch.id'
							: 'dropdown.id',
						value1.value,
					);
					const attr2: BulkAttributeValueInput = set(
						{
							id: variantManifests[1].attribute.id,
						},
						manifestEditor?.checkAttributeIsSwatch(variantManifests[1].attribute.id)
							? 'swatch.id'
							: 'dropdown.id',
						value2.value,
					);

					const newVariant: ProductVariantBulkCreateInput = {
						attributes: [attr1, attr2],
						name: `${value1.label}-${value2.label}`,
						sku: `${value1.label}-${value2.label}-${randomString(RandomStringLength)}`,
						trackInventory: true,
						channelListings: [],
						weight: 0,
						preorder: {},
						stocks: customStockInputs,
					};

					newVariantDetails.push(newVariant);
				}
			}

			variantsInputDetails = newVariantDetails;
		}
	};

	$effect(() => {
		productVariantsInput = variantsInputDetails.map((item) => {
			return {
				...item,
				stocks: item.stocks?.map((stock) => omit(stock, [WarehouseNameKey]) as StockInput),
				channelListings: item.channelListings?.map(
					(listing) =>
						omit(listing, ['label', 'value', 'currency']) as ProductVariantChannelListingAddInput,
				),
			};
		});
	});

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

		if (
			variantsInputDetails.some((inputDetail) =>
				inputDetail.channelListings?.some((listing) => !channelIdsMap[listing.channelId]),
			)
		)
			// b) variant detail sections
			variantsInputDetails = variantsInputDetails.map((inputDetail) => {
				inputDetail.channelListings = inputDetail.channelListings?.filter(
					(chan) => channelIdsMap[chan.channelId],
				);

				return inputDetail;
			});
	});

	const handleQuickFillingClick = () => {
		const canQuickFillingStocks = true;
		const canQuickFillingChannels = quickFillingValues.channels.length > 0;

		if (canQuickFillingChannels || canQuickFillingStocks) {
			variantsInputDetails = variantsInputDetails.map((variantDetail) => {
				if (canQuickFillingChannels) {
					variantDetail.channelListings = quickFillingValues.channels.map(
						({ channelId, price, costPrice, label, value, currency }) => ({
							channelId,
							price,
							costPrice,

							label, // extra field
							value, // extra field
							currency, // extra field
						}),
					);
				}
				if (canQuickFillingStocks) {
					variantDetail.stocks = quickFillingValues.stocks.map((stock) => ({
						warehouse: stock.warehouse,
						quantity: stock.quantity,
						[WarehouseNameKey]: stock.warehouseName, // this field is needed for displaying
					}));
				}

				const { endDate, globalThreshold } = quickFillingValues.preOrder;
				variantDetail.preorder = { endDate, globalThreshold };
				variantDetail.weight = quickFillingValues.weight;

				return variantDetail;
			});
		}
	};

	const onManifestDeleted = () => {
		// remove the manifest
		if (!variantManifests.length) {
			variantsInputDetails = [];
			return;
		}

		// update the variants input details
		variantsInputDetails = variantManifests[0].values.map((value) => {
			const isSwatchAttribute = manifestEditor?.checkAttributeIsSwatch(
				variantManifests[0].attribute.id,
			);
			const attributeProp: BulkAttributeValueInput = {
				id: variantManifests[0].attribute.id,
			};

			set(attributeProp, isSwatchAttribute ? 'swatch.id' : 'dropdown.id', value.value);

			return {
				attributes: [attributeProp],
				name: `${value.value}`,
				sku: `${value.value}`,
				trackInventory: true,
				channelListings: [],
				weight: 0,
				preorder: {},
			};
		});
	};
</script>

<div class="space-y-2">
	<VariantManifests
		bind:variantManifests
		{productTypeId}
		{onVariantValuesChange}
		{onManifestDeleted}
		bind:privateMetadata
		bind:this={manifestEditor}
		{disabled}
	/>

	{#if variantManifests.length}
		<VariantQuickFillingValues
			{channelSelectOptions}
			{disabled}
			bind:quickFillingValues
			{handleQuickFillingClick}
		/>

		<!-- MARK: DETAILS -->
		<div class={SitenameCommonClassName}>
			<table class="w-full text-sm h-fit text-left table text-gray-600">
				<thead>
					<tr>
						<th class={ThClass}>
							<Badge text={variantManifests[0].attribute.name} size="sm" />
						</th>
						{#if variantManifests.length === MAX_VARIANT_TYPES}
							<th class={ThClass}>
								<Badge text={variantManifests[1].attribute.name} size="sm" />
							</th>
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
					{#each variantsInputDetails as variantInputDetail, detailIdx (detailIdx)}
						{@const style = productVariantsMediaMap[variantInputDetail.sku!]
							? `background-image: url(${productVariantsMediaMap[variantInputDetail.sku!].url}); background-size: cover; background-position: center;`
							: ''}
						<tr class={`variant-table-row ${quickFillingHighlightClass} border-b border-gray-200`}>
							{#if variantManifests.length === MAX_VARIANT_TYPES}
								{#if detailIdx % variantManifests[1].values.length === 0}
									<td
										class={['text-center font-medium text-blue-600 bg-blue-50']}
										rowspan={variantManifests[1].values.length}
									>
										{variantInputDetail.name?.split('-')[0]}
									</td>
								{/if}
								<td class="text-center">
									{@render VariantMediaSnippets.VariantImageBtn(
										variantInputDetail.name?.split('-')[1]!,
										style,
										() => (currentVariantSkuToAssignMedia = variantInputDetail.sku!),
										disabled,
									)}
								</td>
							{:else}
								<td class="text-center">
									{@render VariantMediaSnippets.VariantImageBtn(
										variantInputDetail.name?.split('-')[0]!,
										style,
										() => (currentVariantSkuToAssignMedia = variantInputDetail.sku!),
										disabled,
									)}
								</td>
							{/if}
							<!-- CHANNELS -->
							<td class="channel-td max-w-3xs min-w-28">
								{#if !channelSelectOptions?.length}
									<SelectSkeleton size="sm" />
								{:else}
									<Select
										size="sm"
										{disabled}
										options={channelSelectOptions}
										value={variantInputDetail.channelListings?.map((item) => item.channelId)}
										multiple
										onchange={(opts) => {
											variantInputDetail.channelListings =
												opts as unknown as ProductVariantChannelListingAddInput[];
										}}
									/>
								{/if}
							</td>
							<!-- PRICE -->
							<td class="price-td">
								<div class="space-y-1">
									{#each variantInputDetail.channelListings || [] as channelListing, idx (idx)}
										{@const currency =
											channelListing['currency' as keyof ProductVariantChannelListingAddInput]}
										<Input
											type="number"
											min={0}
											{disabled}
											size="xs"
											placeholder={currency}
											bind:value={variantInputDetail.channelListings![idx].price}
											variant={channelListing.price < 0 ? 'error' : 'info'}
											subText={typeof channelListing.price === 'number' && channelListing.price < 0
												? $CommonState.NonNegativeError
												: ''}
										>
											{#snippet action()}
												<span class="text-[8px] font-semibold">
													{currency}
												</span>
											{/snippet}
										</Input>
									{/each}
								</div>
							</td>
							<!-- COST PRICE -->
							<td class="cost-price-td">
								<div class="space-y-1">
									{#each variantInputDetail.channelListings || [] as channelListing, idx (idx)}
										{@const currency =
											channelListing['currency' as keyof ProductVariantChannelListingAddInput]}
										<Input
											type="number"
											min={0}
											{disabled}
											size="xs"
											placeholder={currency}
											bind:value={variantInputDetail.channelListings![idx].costPrice}
											variant={channelListing.costPrice < 0 ? 'error' : 'info'}
											subText={typeof channelListing.costPrice === 'number' &&
											channelListing.costPrice < 0
												? $CommonState.NonNegativeError
												: ''}
										>
											{#snippet action()}
												<span class="text-[8px] font-semibold">
													{currency}
												</span>
											{/snippet}
										</Input>
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
										<span class="text-[10px] font-semibold">kg</span>
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
											label={stock[WarehouseNameKey] as string}
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
	{/if}
</div>

{@render VariantMediaSnippets.VariantMediaModal(
	!!currentVariantSkuToAssignMedia,
	productMedias,
	(media) => (productVariantsMediaMap[currentVariantSkuToAssignMedia!] = media),
	() => (currentVariantSkuToAssignMedia = undefined),
	() => delete productVariantsMediaMap[currentVariantSkuToAssignMedia!],
)}
