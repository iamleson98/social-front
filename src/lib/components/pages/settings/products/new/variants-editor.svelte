<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ATTRIBUTE_VALUE_CREATE_MUTATION } from '$lib/api/admin/attribute';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Icon, Plus } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type BulkAttributeValueInput,
		type MetadataInput,
		type Mutation,
		type MutationAttributeValueCreateArgs,
		type ProductChannelListingAddInput,
		type ProductChannelListingUpdateInput,
		type ProductVariantBulkCreateInput,
		type ProductVariantChannelListingAddInput,
		type Query,
		type QueryProductTypeArgs,
		type StockInput,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import {
		checkIfGraphqlResultHasError,
		randomString,
		SitenameCommonClassName,
	} from '$lib/utils/utils';
	import {
		ProductPrivateMetadataVariantAttributeUsedKey,
		type ChannelSelectOptionProps,
		type QuickFillHighlight,
		type QuickFillingProps,
		type VariantManifest,
	} from './utils';
	import VariantManifestItem from './variant-manifest-item.svelte';
	import VariantQuickFillingValues from './variant-quick-filling-values.svelte';
	import dayjs from 'dayjs';
	import { omit } from 'es-toolkit';
	import { set } from 'es-toolkit/compat';

	type Props = {
		productTypeId: string;
		/** This is provided by the channel listing selector section */
		channelsListing: ProductChannelListingUpdateInput;
		disabled?: boolean;
		productMedias: MediaObject[];
		productVariantsInput: ProductVariantBulkCreateInput[];
		privateMetadata: MetadataInput[];
	};

	let {
		productTypeId,
		channelsListing,
		disabled,
		productVariantsInput = $bindable([]),
		privateMetadata = $bindable(),
	}: Props = $props();

	const WarehouseNameKey = 'warehouseName' as keyof StockInput;

	const MAX_VARIANT_TYPES = 2;
	const MIN_DAYS_FOR_PREORDER = 5;
	const MAX_DAYS_FOR_PREORDER = 15;
	const DAYJS_NOW = dayjs();

	const ProductTypeDetailQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: '',
		},
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	let variantManifests = $state<VariantManifest[]>([]);
	let quickFillingHighlightClass = $state<QuickFillHighlight>();
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	/**
	 * there are at most 2 attributes used for variants creation, so this list has 2 booleans.
	 * If user can not find her desired attribute values, we support auto create feature,
	 * so user do not have to visit the attribute detail page to add more values.
	 *
	 * With that said, after an attribute value is added, we must use this list, to trigger according select to refetch and find for created attribute values.
	 */
	let manifestPerformFetchingAttributeValues = $state([false, false]);
	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>(productVariantsInput);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true,
	});
	let innerLoading = $state(false);
	const ShouldDisable = $derived(disabled || innerLoading);

	/**
	 * If there is 1 variant, there will be 8 columns -> each column's width = 1/9 = 11.11%, 2 variants -> 9 columns -> each column's width = 1/8 = 12.5%;
	 */
	const ThClass = $derived.by(() => {
		if (!variantManifests.length) return '';
		if (variantManifests.length === 1) return 'w-[12.5%]!';
		return 'w-[11.11%]!';
	});

	/**
	 * This function helps setting the attribute usage by product variants, into private metadata
	 */
	const recalculateVariantAttributeMetadata = () => {
		const setAttrValues = variantManifests.filter((item) => !!item.attribute.id);
		if (!setAttrValues.length) return;

		const attrInforValue = JSON.stringify(setAttrValues);
		if (
			!privateMetadata.some((item) => item.key === ProductPrivateMetadataVariantAttributeUsedKey)
		) {
			privateMetadata.push({
				key: ProductPrivateMetadataVariantAttributeUsedKey,
				value: attrInforValue,
			});
		} else {
			privateMetadata = privateMetadata.map((item) => {
				if (item.key === ProductPrivateMetadataVariantAttributeUsedKey) {
					item.value = attrInforValue;
				}
				return item;
			});
		}
	};

	const handleVariantValuesChange = (
		manifestIdx: number,
		options?: SelectOption | SelectOption[],
	) => {
		variantManifests[manifestIdx].values = (options as SelectOption[]) || [];

		if (variantManifests.length === 1) {
			variantsInputDetails = variantManifests[0].values.map<ProductVariantBulkCreateInput>(
				(attrValue) => {
					const variantWithAttrValueExisted = variantsInputDetails.find((variantDetail) =>
						variantDetail.attributes.some(
							(attrInput) =>
								attrInput.dropdown?.id === attrValue.value ||
								attrInput.swatch?.id === attrValue.value,
						),
					);

					if (variantWithAttrValueExisted) return variantWithAttrValueExisted;

					const isSwatchAttribute =
						$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
							(attr) => attr.attribute.id === variantManifests[0].attribute.id,
						)?.attribute.inputType === AttributeInputTypeEnum.Swatch;

					const attributeProp: BulkAttributeValueInput = {
						id: variantManifests[0].attribute.id,
					};

					set(
						attributeProp,
						isSwatchAttribute ? 'swatch.value' : 'dropdown.value',
						attrValue.value,
					);

					return {
						attributes: [attributeProp],
						name: `${attrValue.label}`,
						sku: `${attrValue.label}-${randomString(6)}`,
						trackInventory: true,
						channelListings: [],
						weight: 0,
						preorder: {},
					};
				},
			);
		} else {
			const newVariantDetails = [];

			for (const value1 of variantManifests[0].values) {
				for (const value2 of variantManifests[1].values) {
					// Check if a variant that already has 2 selected attributes.
					// And also has according 1 attribute value for each attribute.
					const existingVariant = variantsInputDetails.find((variantDetail) => {
						if (variantDetail.attributes.length !== 2) return false;

						let value1Used = false,
							value2Used = false;

						for (const attr of variantDetail.attributes) {
							if (attr.dropdown?.id === value1.value || attr.swatch?.id === value1.value)
								value1Used = true;
							else if (attr.swatch?.id === value2.value || attr.swatch?.id === value2.value)
								value2Used = true;
						}

						return value1Used && value2Used;
					});

					if (existingVariant) {
						newVariantDetails.push(existingVariant);
						continue;
					}

					const attributes = variantManifests.map((manifest) => {
						const isSwatchAttr = checkAttributeIsSwatch(manifest.attribute.id);
						const attributeProps: BulkAttributeValueInput = {
							id: manifest.attribute.id,
						};
						set(attributeProps, isSwatchAttr ? 'swatch.value' : 'dropdown.value', value1.value);

						return attributeProps;
					});

					const newVariant: ProductVariantBulkCreateInput = {
						attributes,
						name: `${value1.label}-${value2.label}`,
						sku: `${value1.label}-${value2.label}-${randomString(6)}`,
						trackInventory: true,
						channelListings: [],
						weight: 0,
						preorder: {},
					};

					newVariantDetails.push(newVariant);
				}
			}

			variantsInputDetails = newVariantDetails;
		}

		recalculateVariantAttributeMetadata();
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

	const AvailableAttributeOptions = $derived(
		$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes
			?.filter((attr) => attr.variantSelection)
			.map<SelectOption>((attr) => ({
				value: attr.attribute.id,
				label: (attr.attribute.name || attr.attribute.slug) as string,
				disabled: variantManifests.some((manifest) => manifest.attribute.id === attr.attribute.id),
			})) || [],
	);

	$effect(() => {
		if (!!productTypeId)
			ProductTypeDetailQuery.reexecute({
				variables: { id: productTypeId },
			});
	});

	const handleAddVariantManifest = async () => {
		// when a variant manifest is added, we must force the <Select /> to fetch attribute values
		if (!variantManifests.length) manifestPerformFetchingAttributeValues[0] = true;
		else manifestPerformFetchingAttributeValues[1] = true;

		variantManifests = variantManifests.concat({
			attribute: {
				id: '',
				name: '',
			},
			values: [],
		});

		recalculateVariantAttributeMetadata();
	};

	const handleAddNewAttributeValue = async (manifestIdx: number, value: string) => {
		const attributeId = variantManifests[manifestIdx].attribute.id;

		innerLoading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeValueCreate'>,
			MutationAttributeValueCreateArgs
		>(ATTRIBUTE_VALUE_CREATE_MUTATION, {
			attribute: attributeId,
			input: {
				name: value,
				value: checkAttributeIsSwatch(attributeId) ? value : undefined,
			},
		});
		innerLoading = false;

		if (checkIfGraphqlResultHasError(result, 'attributeValueCreate')) return;

		// added value success, perform refetching now
		manifestPerformFetchingAttributeValues[manifestIdx] = true;
	};

	const checkAttributeIsSwatch = (attributeId: string) => {
		return (
			$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
				(attr) => attr.attribute.id === attributeId,
			)?.attribute.inputType === AttributeInputTypeEnum.Swatch
		);
	};

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

	const handleDeleteVariant = (variantIdx: number) => {
		const currentNumberOfManifests = variantManifests.length;

		// remove the manifest
		variantManifests = variantManifests.filter((_, idx) => idx !== variantIdx);
		if (!variantManifests.length) {
			variantsInputDetails = [];
			return;
		}

		// trigger fetching attribute values again
		if (variantIdx === 0 && currentNumberOfManifests === MAX_VARIANT_TYPES)
			manifestPerformFetchingAttributeValues[0] = true;

		// update the variants input details
		variantsInputDetails = variantManifests[0].values.map((value) => {
			const isSwatchAttribute = checkAttributeIsSwatch(variantManifests[0].attribute.id);
			const attributeProp: BulkAttributeValueInput = {
				id: variantManifests[0].attribute.id,
			};

			if (isSwatchAttribute) set(attributeProp, 'swatch.value', value.value);
			else set(attributeProp, 'dropdown.value', value.value);

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
	{#if $ProductTypeDetailQuery.fetching}
		<div class="grid grid-cols-2 gap-2">
			<SelectSkeleton label />
			<SelectSkeleton label />
		</div>
	{:else if $ProductTypeDetailQuery.error}
		<Alert variant="error" size="sm">{$ProductTypeDetailQuery.error.message}</Alert>
	{:else if $ProductTypeDetailQuery.data?.productType}
		<div class="grid grid-cols-2 gap-2">
			{#each variantManifests as maniFest, idx (idx)}
				<VariantManifestItem
					index={idx}
					bind:manifest={variantManifests[idx]}
					onDeleteVariant={handleDeleteVariant}
					onAttributeValuesChange={handleVariantValuesChange}
					onSelectAddNewAttributeValue={handleAddNewAttributeValue}
					attributeOptions={AvailableAttributeOptions}
					bind:performFetchAttributeValues={manifestPerformFetchingAttributeValues[idx]}
				/>
			{/each}
			{#if variantManifests.length < MAX_VARIANT_TYPES && AvailableAttributeOptions.some((opt) => !opt.disabled)}
				<button
					class={[
						'border-dashed border w-full h-full flex items-center justify-center rounded-lg tooltip tooltip-top border-blue-500 text-blue-500 cursor-pointer py-5 hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50',
					]}
					onclick={handleAddVariantManifest}
					data-tip={$tranFunc('product.addVariant')}
					aria-label={$tranFunc('product.addVariant')}
				>
					<Icon icon={Plus} size="xl" />
				</button>
			{/if}
		</div>
	{/if}

	{#if variantManifests.length}
		<VariantQuickFillingValues
			{channelSelectOptions}
			disabled={ShouldDisable}
			bind:quickFillingValues
			{handleQuickFillingClick}
		/>

		<!-- MARK: DETAILS -->
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
					{#each variantsInputDetails as variantInputDetail, detailIdx (detailIdx)}
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
									<Select
										size="sm"
										disabled={ShouldDisable}
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
										<Input
											type="number"
											min={0}
											disabled={ShouldDisable}
											size="xs"
											placeholder={channelListing[
												'currency' as keyof ProductVariantChannelListingAddInput
											]}
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
											disabled={ShouldDisable}
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
									disabled={ShouldDisable}
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
									disabled={ShouldDisable}
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
									disabled={ShouldDisable}
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
											disabled={ShouldDisable}
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
									disabled={ShouldDisable}
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

<style lang="postcss">
	@reference "tailwindcss";

	th:not(:last-child) {
		@apply border-r border-gray-200 py-1 px-1.5;
	}

	tr {
		@apply border-b border-gray-300;
	}

	tr:nth-child(even) {
		@apply bg-gray-50;
	}

	td {
		@apply p-1;
	}
</style>
