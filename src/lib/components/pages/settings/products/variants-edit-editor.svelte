<script lang="ts" module>
	// defined as const to make it easier to use
	export const ChannelListingExistingKey =
		'existing' as keyof ProductVariantChannelListingUpdateInput;
	export const ChannelListingCurrentKey =
		'current' as keyof ProductVariantChannelListingUpdateInput;

	export const StockExistingKey = 'existing' as keyof ProductVariantStocksUpdateInput;
	export const StockCurrentKey = 'current' as keyof ProductVariantStocksUpdateInput;

	export const StockWarehouseNameKey = 'warehouseName' as keyof ProductVariantStocksUpdateInput;
</script>

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
		type ProductVariantBulkUpdateInput,
		type ProductVariantChannelListing,
		type ProductVariantChannelListingUpdateInput,
		type ProductVariantStocksUpdateInput,
		type Stock,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { randomString, SitenameCommonClassName } from '$lib/utils/utils';
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
		type QuickFillingProps,
		type VariantManifest,
	} from './utils';
	import VariantManifests from './variant-manifests.svelte';
	import VariantQuickFillingValues from './variant-quick-filling-values.svelte';
	import dayjs from 'dayjs';
	import { set } from 'es-toolkit/compat';
	import { onMount } from 'svelte';

	type Props = {
		disabled?: boolean;
		/** This is provided by the channel listing selector section */
		channelsListing: ProductChannelListingUpdateInput;
		productVariantsInput: ProductVariantBulkUpdateInput[];
		/** To set the attribute informations used by variants */
		privateMetadata: MetadataInput[];
		productTypeId: string;
	};

	let {
		disabled,
		productVariantsInput = $bindable(),
		privateMetadata = $bindable(),
		channelsListing,
		productTypeId,
	}: Props = $props();

	let manifestEditor = $state<ReturnType<typeof VariantManifests>>();
	let variantManifests = $state<VariantManifest[]>([]);
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
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

	const DAYJS_NOW = dayjs();

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
	});

	/**
	 * If there is 1 variant, there will be 8 columns -> each column's width = 1/9 = 11.11%, 2 variants -> 9 columns -> each column's width = 1/8 = 12.5%;
	 */
	const ThClass = $derived(calculateTableColumnWidth(variantManifests));

	const onManifestDeleted = () => {
		if (!variantManifests.length) {
			productVariantsInput = [];
			return;
		}
	};

	const onVariantValuesChange = () => {
		if (variantManifests.length === 1) {
			productVariantsInput = variantManifests[0].values.map<ProductVariantBulkUpdateInput>(
				(attrValue) => {
					// check if there is some variant with those attribute values, already existed
					// If there is, return it as is. (no need to recreate)
					const variantWithAttrValueExisted = productVariantsInput.find((variantDetail) =>
						variantDetail.attributes?.some(
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

					const res: ProductVariantBulkUpdateInput = {
						attributes: [attributeProp],
						name: `${attrValue.label}`,
						sku: `${attrValue.label}-${randomString(RandomStringLength)}`,
						trackInventory: true,
						channelListings: {
							[ChannelListingCurrentKey]: [],
						},
						weight: 0,
						preorder: {},
						// NOTE: Later when we come to handle update, all variants with empty IDs like below will be bulk created.
						id: '',
						stocks: {
							[StockCurrentKey]: customStockInputs,
						},
					};

					return res;
				},
			);
		} else {
			const newVariantDetails = [];

			for (const value1 of variantManifests[0].values) {
				for (const value2 of variantManifests[1].values) {
					// Check if a variant that already has 2 selected attributes.
					// And also has according 1 attribute value for each attribute.
					const existingVariant = productVariantsInput.find((variantDetail) => {
						if ((variantDetail.attributes?.length || 0) < 2) return false;

						let value1Used = false,
							value2Used = false;

						for (const attr of variantDetail.attributes || []) {
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

					const newVariant: ProductVariantBulkUpdateInput = {
						attributes: [attr1, attr2],
						name: `${value1.label}-${value2.label}`,
						sku: `${value1.label}-${value2.label}-${randomString(RandomStringLength)}`,
						trackInventory: true,
						channelListings: {
							[ChannelListingCurrentKey]: [],
						},
						weight: { value: 0 },
						preorder: {},
						// NOTE: Later when we come to handle update, all variants with empty IDs like below will be bulk created.
						id: '',
						stocks: {
							[StockCurrentKey]: customStockInputs,
						},
					};

					newVariantDetails.push(newVariant);
				}
			}

			productVariantsInput = newVariantDetails;
		}
	};

	const handleQuickFillingClick = () => {
		const canQuickFillingStocks = true;
		const canQuickFillingChannels = quickFillingValues.channels.length > 0;

		if (canQuickFillingChannels || canQuickFillingStocks) {
			productVariantsInput = productVariantsInput.map<ProductVariantBulkUpdateInput>(
				(variantDetail) => {
					if (canQuickFillingChannels) {
						variantDetail.channelListings = {
							[ChannelListingCurrentKey]: quickFillingValues.channels.map(
								({ channelId, price, costPrice, label, value, currency }) => ({
									channelId,
									price: {
										amount: price,
										currency,
									},
									costPrice: {
										amount: costPrice,
										currency,
									},

									label, // extra field
									value, // extra field
									currency, // extra field
									channel: { id: channelId, currencyCode: currency },
								}),
							),
						};
					}
					if (canQuickFillingStocks) {
						variantDetail.stocks = {
							[StockCurrentKey]: quickFillingValues.stocks.map((stock) => ({
								warehouse: stock.warehouse,
								quantity: stock.quantity,
								[StockWarehouseNameKey]: stock.warehouseName, // this field is needed for displaying
							})),
						};
					}

					const { endDate, globalThreshold } = quickFillingValues.preOrder;
					variantDetail.preorder = { endDate, globalThreshold };
					variantDetail.weight = {
						value: quickFillingValues.weight,
					};

					return variantDetail;
				},
			);
		}
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

	<VariantQuickFillingValues
		{channelSelectOptions}
		{disabled}
		bind:quickFillingValues
		{handleQuickFillingClick}
	/>

	<div class={SitenameCommonClassName}>
		<table class="w-full text-sm h-fit text-left table text-gray-600">
			<thead>
				<tr>
					<th class={ThClass}>
						<Badge text={variantManifests[0]?.attribute?.name} size="sm" />
					</th>
					{#if variantManifests.length === MAX_VARIANT_TYPES}
						<th class={ThClass}>
							<Badge text={variantManifests[1]?.attribute?.name} size="sm" />
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
									variantInputDetail.channelListings?.[ChannelListingCurrentKey]?.map(
										(item) => (item as any).channel.id,
									) || []}
								<Select
									size="sm"
									{disabled}
									options={channelSelectOptions}
									value={currentChannelIds}
									multiple
									onchange={(opts) => {
										const selectedOptions = (opts || []) as ChannelSelectOptionProps[];

										variantInputDetail.channelListings![ChannelListingCurrentKey] =
											selectedOptions.map((opt) => {
												const existingValue = variantInputDetail.channelListings![
													ChannelListingCurrentKey
												]?.find((item: any) => item.channel.id === opt.value);

												if (existingValue) return existingValue;

												return {
													channelId: opt.value as string,
													costPrice: {
														currency: opt.currency,
														amount: 0,
														fractionDigits: 0,
														fractionalAmount: 0,
													},
													price: {
														currency: opt.currency,
														amount: 0,
														fractionDigits: 0,
														fractionalAmount: 0,
													},

													id: '',
													channel: { currencyCode: opt.currency, id: opt.channelId },
												};
											}) as any;
									}}
								/>
							{/if}
						</td>
						<!-- PRICE -->
						<td class="price-td">
							<div class="space-y-1">
								{#each variantInputDetail.channelListings?.[ChannelListingCurrentKey] as unknown as ProductVariantChannelListing[] as channelListing, idx (idx)}
									<Input
										type="number"
										min={0}
										{disabled}
										size="xs"
										placeholder={channelListing.channel.currencyCode}
										bind:value={channelListing.price!.amount}
										variant={channelListing.price!.amount < 0 ? 'error' : 'info'}
										subText={channelListing.price!.amount < 0 ? $CommonState.NonNegativeError : ''}
									>
										{#snippet action()}
											<span class="text-[8px] font-semibold">
												{channelListing.channel.currencyCode}
											</span>
										{/snippet}
									</Input>
								{/each}
							</div>
						</td>
						<!-- COST PRICE -->
						<td class="cost-price-td">
							<div class="space-y-1">
								{#each variantInputDetail.channelListings?.[ChannelListingCurrentKey] as unknown as ProductVariantChannelListing[] as channelListing, idx (idx)}
									<Input
										type="number"
										min={0}
										{disabled}
										size="xs"
										placeholder={channelListing.channel.currencyCode}
										bind:value={channelListing.costPrice!.amount}
										variant={channelListing.costPrice!.amount < 0 ? 'error' : 'info'}
										subText={channelListing.costPrice!.amount < 0
											? $CommonState.NonNegativeError
											: ''}
									>
										{#snippet action()}
											<span class="text-[8px] font-semibold">
												{channelListing.channel.currencyCode}
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
								bind:value={variantInputDetail.weight!.value}
								variant={variantInputDetail.weight!.value >= 0 ? 'info' : 'error'}
								subText={variantInputDetail.weight!.value >= 0 ? '' : $CommonState.NonNegativeError}
							>
								{#snippet action()}
									<span class="text-[9px] font-semibold">kg</span>
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
								{#each variantInputDetail.stocks?.[StockCurrentKey] as unknown as Stock[] as stock, idx (idx)}
									<Input
										size="xs"
										label={stock.warehouse.name || (stock as any)[StockWarehouseNameKey]}
										placeholder={$tranFunc('product.stock')}
										bind:value={stock.quantity}
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
</div>
