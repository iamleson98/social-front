<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		ATTRIBUTE_VALUE_CREATE_MUTATION,
		ATTRIBUTE_VALUES_QUERY,
	} from '$lib/api/admin/attribute';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Icon, MdiWeightKg, Plus, Trash } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input, Label } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableSelect,
		Select,
		SelectSkeleton,
		type SelectOption,
	} from '$lib/components/ui/select';
	import { type GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import {
		AttributeInputTypeEnum,
		type BulkAttributeValueInput,
		type Mutation,
		type MutationAttributeValueCreateArgs,
		type ProductVariantBulkCreateInput,
		type ProductVariantChannelListingAddInput,
		type Query,
		type QueryProductTypeArgs,
		type StockInput,
	} from '$lib/gql/graphql';
	import { type CurrencyCode, CurrencyIconMap } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { set } from 'es-toolkit/compat';
	import type { ChannelSelectOptionProps, QuickFillHighlight, QuickFillingProps } from './utils';
	import dayjs from 'dayjs';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { slide } from 'svelte/transition';

	type Props = {
		productTypeId: string;
		productName?: string;
	};

	let { productTypeId, productName = '' }: Props = $props();

	type VariantManifest = {
		attribute: {
			id: string;
			name: string;
		};
		values: SelectOption[];
	};

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

	const VARIANT_ATTRIBUTE_HINTS = [
		{ title: $tranFunc('product.channelHint') },
		{ title: $tranFunc('product.priceHint') },
		{ title: $tranFunc('product.costPriceHint') },
		{ title: $tranFunc('product.stockHint') },
		{ title: $tranFunc('product.weightHint') },
		{ title: $tranFunc('product.skuHint') },
		{
			title: $tranFunc('product.preorderHint', {
				min: MIN_DAYS_FOR_PREORDER,
				max: MAX_DAYS_FOR_PREORDER,
			}),
		},
	];

	let variantManifests = $state<VariantManifest[]>([]);
	let loading = $state(false);
	let quickFillingHighlightClass = $state<QuickFillHighlight>();
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	let manifestPerformFetchingAttributeValues = $state([false, false]);
	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([]);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true,
	});
	let showQuickFillingAdvancedSettings = $state(false);

	/** check if quick filling form has any error */
	const quickFillingError = $derived.by(() => {
		if (quickFillingValues.stocks.some((stock) => stock.quantity % 1 !== 0)) return true;

		const {
			preOrder: { globalThreshold, endDate },
			quantityLimitPerCustomer,
		} = quickFillingValues;
		if (typeof globalThreshold === 'number' && globalThreshold % 1 !== 0) return true;
		if (typeof quantityLimitPerCustomer === 'number' && quantityLimitPerCustomer % 1 !== 0)
			return true;

		if (endDate) {
			try {
				new Date(endDate);
			} catch {
				return true;
			}
		}

		return false;
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
		if (!variantManifests.length) manifestPerformFetchingAttributeValues[0] = true;
		else manifestPerformFetchingAttributeValues[1] = true;

		variantManifests = variantManifests.concat({
			attribute: {
				id: '',
				name: '',
			},
			values: [],
		});
	};

	const handleFocusHighlightQuickFilling = (highlight?: QuickFillHighlight) =>
		(quickFillingHighlightClass = highlight);

	const handleAddNewAttributeValue = async (manifestIdx: number, value: string) => {
		const attributeId = variantManifests[manifestIdx].attribute.id;

		const isSwatchAttribute =
			$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
				(attr) => attr.attribute.id === attributeId,
			)?.attribute.inputType === AttributeInputTypeEnum.Swatch;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeValueCreate'>,
			MutationAttributeValueCreateArgs
		>(ATTRIBUTE_VALUE_CREATE_MUTATION, {
			attribute: attributeId,
			input: {
				name: value,
				value: isSwatchAttribute ? value : undefined,
			},
		});
		loading = false;

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

					if (isSwatchAttribute) set(attributeProp, 'swatch.id', attrValue.value);
					else set(attributeProp, 'dropdown.id', attrValue.value);

					return {
						attributes: [attributeProp],
						name: `${attrValue.label}`,
						sku: `${attrValue.label}`,
						trackInventory: true,
						channelListings: [],
						weight: 0,
						preorder: {},
					};
				},
			);

			return;
		}

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
					if (isSwatchAttr) set(attributeProps, 'swatch.id', value1.value);
					else set(attributeProps, 'dropdown.id', value2.value);

					return attributeProps;
				});

				const newVariant: ProductVariantBulkCreateInput = {
					attributes,
					name: `${value1.label}-${value2.label}`,
					sku: `${value1.label}-${value2.label}`,
					trackInventory: true,
					channelListings: [],
					weight: 0,
					preorder: {},
				};

				newVariantDetails.push(newVariant);
			}
		}

		variantsInputDetails = newVariantDetails;
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
						warehouseName: stock.warehouseName, // this field is needed for displaying
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
		if (variantIdx === 0 && currentNumberOfManifests === 2)
			manifestPerformFetchingAttributeValues[0] = true;

		// update the variants input details
		variantsInputDetails = variantManifests[0].values.map((value) => {
			const isSwatchAttribute = checkAttributeIsSwatch(variantManifests[0].attribute.id);
			const attributeProp: BulkAttributeValueInput = {
				id: variantManifests[0].attribute.id,
			};

			if (isSwatchAttribute) set(attributeProp, 'swatch.id', value.value);
			else set(attributeProp, 'dropdown.id', value.value);

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

<div class={SitenameCommonClassName}>
	{#if $ProductTypeDetailQuery.fetching}
		<div class="grid grid-cols-2 gap-2">
			<SelectSkeleton label />
			<SelectSkeleton label />
		</div>
	{:else if $ProductTypeDetailQuery.error}
		<Alert variant="error" size="sm">{$ProductTypeDetailQuery.error.message}</Alert>
	{:else if $ProductTypeDetailQuery.data?.productType}
		<div class="grid grid-cols-2 gap-2">
			{#each variantManifests as manifest, idx (idx)}
				<div class="space-y-2">
					<Select
						placeholder="Select an attribute"
						label="Variant #{idx + 1}"
						options={AvailableAttributeOptions}
						bind:value={manifest.attribute.id}
						onchange={(opt) => opt && (manifest.attribute.name = (opt as SelectOption).label)}
					/>

					{#if manifest.attribute.id}
						{#key manifest.attribute.id}
							<GraphqlPaginableSelect
								disabled={loading}
								query={ATTRIBUTE_VALUES_QUERY}
								variables={{
									id: manifest.attribute.id,
									first: 15,
									filter: { search: '' },
								} as GraphqlPaginationArgs}
								label="Attribute values"
								resultKey={'attribute.choices' as keyof Query}
								variableSearchQueryPath="filter.search"
								optionValueKey="id"
								optionLabelKey="name"
								multiple
								value={manifest.values.map((item) => item.value)}
								onchange={(opt) => handleVariantValuesChange(idx, opt)}
								size="sm"
								bind:performDataFetching={manifestPerformFetchingAttributeValues[idx]}
								onNotFoundQuerySelected={(newValue) =>
									newValue && handleAddNewAttributeValue(idx, newValue)}
							/>
						{/key}
					{/if}

					<Button
						endIcon={Trash}
						size="sm"
						disabled={loading}
						fullWidth
						variant="light"
						color="red"
						onclick={() => handleDeleteVariant(idx)}
					>
						{$tranFunc('product.delVariant')}
					</Button>
				</div>
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
		<!-- MARK: QUICK FILLING -->
		<div class="mb-4 rounded-lg bg-white p-3 border border-gray-200">
			<Label label={$tranFunc('product.quickFilling')} size="sm" />
			<div class="flex gap-x-2 items-start flex-row w-full">
				<div class="w-11/12 flex gap-1 items-start flex-row">
					<!-- CHANNELS -->
					<div class="w-1/6">
						<div class="text-xs">{$tranFunc('product.channel')}</div>
						{#if !channelSelectOptions?.length}
							<SelectSkeleton size="sm" />
						{:else}
							<Select
								size="sm"
								options={channelSelectOptions}
								onfocus={() => handleFocusHighlightQuickFilling('td-channel-hl')}
								value={quickFillingValues.channels.map((item) => item.channelId)}
								class="w-full"
								disabled={loading}
								multiple
								onchange={(opts) => {
									quickFillingValues.channels = opts as ChannelSelectOptionProps[];
								}}
							/>
						{/if}
					</div>
					<!-- PRICING -->
					<div class="w-2/6">
						{#if quickFillingValues.channels.length}
							<div class="flex flex-row text-xs">
								<span class="w-1/2">{$tranFunc('product.price')}</span>
								<span class="w-1/2">{$tranFunc('product.costPrice')}</span>
							</div>
							<div class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-2 rounded-lg">
								{#each quickFillingValues.channels as channel, idx (idx)}
									{@const iconType = CurrencyIconMap[channel.currency as CurrencyCode]}
									<div class="flex gap-1 mt-1">
										<Input
											startIcon={iconType}
											type="number"
											disabled={loading}
											min={0}
											placeholder={channel.currency}
											size="xs"
											class="w-1/2"
											bind:value={channel.price}
											variant={channel.price < 0 ? 'error' : 'info'}
											subText={channel.price < 0 ? $tranFunc('error.negativeNumber') : ''}
											onfocus={() => handleFocusHighlightQuickFilling('td-price-hl')}
										/>
										<Input
											startIcon={iconType}
											type="number"
											min={0}
											placeholder={channel.currency}
											disabled={loading}
											size="xs"
											class="w-1/2"
											bind:value={channel.costPrice}
											variant={channel.costPrice < 0 ? 'error' : 'info'}
											subText={channel.costPrice < 0 ? $tranFunc('error.negativeNumber') : ''}
											onfocus={() => handleFocusHighlightQuickFilling('td-cost-price-hl')}
										/>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<!-- WEIGHT -->
					<div class="w-1/6">
						<div class="text-xs">{$tranFunc('product.weight')}</div>
						<Input
							size="sm"
							type="number"
							bind:value={quickFillingValues.weight}
							min={0}
							disabled={loading}
							startIcon={MdiWeightKg}
							onfocus={() => handleFocusHighlightQuickFilling('td-weight-hl')}
							variant={typeof quickFillingValues.weight === 'number' &&
							quickFillingValues.weight < 0
								? 'error'
								: 'info'}
							subText={typeof quickFillingValues.weight === 'number' &&
							quickFillingValues.weight < 0
								? $tranFunc('error.negativeNumber')
								: undefined}
						/>
					</div>
					<!-- PRE-ORDER -->
					<div class="w-1/6">
						<div class="text-xs">{$tranFunc('common.preorder')}</div>
						<div class="border border-gray-200 bg-white p-2 rounded-lg">
							<!-- QUANTITY LIMIT -->
							<Input
								type="number"
								label={$tranFunc('product.qtyLimit')}
								min={0}
								size="xs"
								disabled={loading}
								class="mb-2"
								bind:value={quickFillingValues.preOrder.globalThreshold}
								variant={typeof quickFillingValues.preOrder.globalThreshold === 'number' &&
								quickFillingValues.preOrder.globalThreshold % 1 !== 0
									? 'error'
									: 'info'}
								subText={typeof quickFillingValues.preOrder.globalThreshold === 'number' &&
								quickFillingValues.preOrder.globalThreshold % 1 !== 0
									? $tranFunc('error.positiveInteger')
									: undefined}
								onfocus={() => handleFocusHighlightQuickFilling('td-preorder-hl')}
							/>
							<!-- AVAILABLE DATE -->
							<EaseDatePicker
								size="xs"
								disabled={loading}
								onchange={(date) => (quickFillingValues.preOrder.endDate = date.date)}
								value={quickFillingValues.preOrder.endDate}
								onfocus={() => handleFocusHighlightQuickFilling('td-preorder-hl')}
								label={$tranFunc('product.preOrderEndDate')}
								allowSelectMonthYears={{
									showMonths: true,
									showYears: { min: 2020, max: DAYJS_NOW.year() + 1 },
								}}
								timeConfig={false}
								timeLock={{
									minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
									maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate(),
								}}
							/>
						</div>
					</div>
					<!-- STOCK -->
					<div class="w-1/6">
						<div class="text-xs">{$tranFunc('product.stock')}</div>
						{#if !quickFillingValues.stocks.length}
							<SelectSkeleton size="xs" />
						{:else}
							<div
								class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-1 rounded-lg space-y-1.5"
							>
								{#each quickFillingValues.stocks as stockInput, idx (idx)}
									{@const isError = stockInput.quantity % 1 !== 0}
									<Input
										type="number"
										placeholder="quantity"
										label={stockInput.warehouseName}
										min={0}
										disabled={loading}
										size="xs"
										onfocus={() => handleFocusHighlightQuickFilling('td-stock-hl')}
										bind:value={stockInput.quantity}
										variant={isError ? 'error' : 'info'}
										subText={isError ? $tranFunc('error.positiveInteger') : ''}
									/>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<!-- APPLY BUTTON -->
				<div class="w-1/12">
					<div class="text-xs">{$tranFunc('common.action')}</div>
					<Button
						class="btn btn-sm grow shrink"
						size="sm"
						disabled={quickFillingError || loading}
						fullWidth
						onclick={handleQuickFillingClick}
						>{$tranFunc('btn.apply')}
					</Button>
				</div>
			</div>

			<!-- QUICK FILLING ADVANCED OPTIONS -->
			<Accordion open={showQuickFillingAdvancedSettings} header={$tranFunc('common.advanced')}>
				<div class="mt-2 flex gap-2 items-start" transition:slide>
					<div>
						<div class="text-xs">{$tranFunc('product.trackInventory')}</div>
						<Checkbox
							bind:checked={quickFillingValues.trackInventory}
							size="md"
							disabled={loading}
							label={quickFillingValues.trackInventory
								? $tranFunc('common.yes')
								: $tranFunc('common.no')}
						/>
					</div>

					<div>
						<div class="text-xs">{$tranFunc('product.qtyLimit')}</div>
						<Input
							type="number"
							bind:value={quickFillingValues.quantityLimitPerCustomer}
							size="sm"
							disabled={loading}
							min="0"
							placeholder={$tranFunc('placeholders.valuePlaceholder')}
							variant={typeof quickFillingValues.quantityLimitPerCustomer === 'number' &&
							quickFillingValues.quantityLimitPerCustomer % 1 !== 0
								? 'error'
								: 'info'}
							subText={typeof quickFillingValues.quantityLimitPerCustomer === 'number' &&
							quickFillingValues.quantityLimitPerCustomer % 1 !== 0
								? $tranFunc('error.positiveInteger')
								: ''}
						/>
					</div>
				</div>
			</Accordion>

			<!-- DOCUMENT -->
			<!-- <Alert variant="info" size="sm" bordered>
				<ol class="text-xs">
					{#each VARIANT_ATTRIBUTE_HINTS as hint, idx (idx)}
						<li>{idx + 1}. {hint.title}</li>
					{/each}
				</ol>
			</Alert> -->
		</div>

		<!-- MARK: DETAILS -->
		<div class="relative h-fit w-full rounded-lg p-3 border border-gray-200 bg-white">
			<table class="w-full text-sm h-fit text-left table text-gray-600 mb-4">
				<thead>
					<tr>
						<th>{variantManifests[0].attribute.name}</th>
						{#if variantManifests.length === MAX_VARIANT_TYPES}
							<th>{variantManifests[1].attribute.name}</th>
						{/if}
						<th>{$tranFunc('product.channel')}</th>
						<th>{$tranFunc('product.price')}</th>
						<th>{$tranFunc('product.costPrice')}</th>
						<th>{$tranFunc('product.weight')}</th>
						<th>{$tranFunc('common.preorder')}</th>
						<th>{$tranFunc('product.stock')}</th>
						<th>{$tranFunc('product.sku')}</th>
					</tr>
				</thead>
				<tbody>
					{#each variantsInputDetails as variantInputDetail, detailIdx (detailIdx)}
						<tr class={`variant-table-row ${quickFillingHighlightClass} border-b border-gray-200`}>
							{#if variantManifests.length === MAX_VARIANT_TYPES}
								{#if detailIdx % variantManifests[1].values.length === 0}
									<td class="text-center" rowspan={variantManifests[1].values.length}>
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
										disabled={loading}
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
								<div class="max-h-28 overflow-y-auto p-1">
									<div class="flex flex-col gap-1">
										{#each variantInputDetail.channelListings || [] as channelListing, idx (idx)}
											{@const iconType =
												CurrencyIconMap[
													channelListing[
														'currency' as keyof ProductVariantChannelListingAddInput
													] as CurrencyCode
												]}
											<Input
												startIcon={iconType}
												type="number"
												min={0}
												disabled={loading}
												size="xs"
												placeholder={channelListing[
													'currency' as keyof ProductVariantChannelListingAddInput
												]}
												bind:value={variantInputDetail.channelListings![idx].price}
												variant={channelListing.price < 0 ? 'error' : 'info'}
												subText={typeof channelListing.price === 'number' &&
												channelListing.price < 0
													? $tranFunc('error.negativeNumber')
													: ''}
											/>
										{/each}
									</div>
								</div>
							</td>
							<!-- COST PRICE -->
							<td class="cost-price-td">
								<div class="max-h-28 overflow-y-auto p-1">
									<div class="flex flex-col gap-1">
										{#each variantInputDetail.channelListings || [] as channelListing, idx (idx)}
											{@const iconType =
												CurrencyIconMap[
													channelListing[
														'currency' as keyof ProductVariantChannelListingAddInput
													] as CurrencyCode
												]}
											<Input
												startIcon={iconType}
												type="number"
												min={0}
												disabled={loading}
												size="xs"
												placeholder={channelListing[
													'currency' as keyof ProductVariantChannelListingAddInput
												]}
												bind:value={variantInputDetail.channelListings![idx].costPrice}
												variant={channelListing.costPrice < 0 ? 'error' : 'info'}
												subText={typeof channelListing.costPrice === 'number' &&
												channelListing.costPrice < 0
													? $tranFunc('error.negativeNumber')
													: ''}
											/>
										{/each}
									</div>
								</div>
							</td>
							<!-- WEIGHT -->
							<td class="weight-td">
								<Input
									type="number"
									size="sm"
									min={0}
									placeholder="kg"
									disabled={loading}
									startIcon={MdiWeightKg}
									bind:value={variantInputDetail.weight}
									variant={variantInputDetail.weight >= 0 ? 'info' : 'error'}
									subText={variantInputDetail.weight >= 0 ? '' : $tranFunc('error.negativeNumber')}
								/>
							</td>
							<!-- PREORDER -->
							<td class="preorder-td">
								<div class="p-1">
									<Input
										type="number"
										min={0}
										label={$tranFunc('product.qtyLimit')}
										size="xs"
										class="mb-2"
										disabled={loading}
										bind:value={variantInputDetail.preorder!.globalThreshold}
										variant={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
										variantInputDetail.preorder.globalThreshold % 1 !== 0
											? 'error'
											: 'info'}
										subText={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
										variantInputDetail.preorder.globalThreshold % 1 !== 0
											? $tranFunc('error.positiveInteger')
											: undefined}
									/>
									<EaseDatePicker
										size="xs"
										label={$tranFunc('product.preOrderEndDate')}
										allowSelectMonthYears={{
											showMonths: true,
											showYears: { min: 2020, max: DAYJS_NOW.year() + 1 },
										}}
										disabled={loading}
										timeConfig={false}
										onchange={(date) => (variantInputDetail.preorder!.endDate = date.date)}
										value={{ date: variantInputDetail.preorder!.endDate }}
										class="mb-2"
										timeLock={{
											minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
											maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate(),
										}}
									/>
								</div>
							</td>
							<!-- STOCK -->
							<td class="stock-td">
								<div class="max-h-28 overflow-y-auto p-1">
									<div class="p-1 space-y-1.5">
										{#each variantInputDetail.stocks || [] as stock, idx (idx)}
											<Input
												size="xs"
												label={stock['warehouseName' as keyof StockInput] as string}
												placeholder={$tranFunc('product.stock')}
												bind:value={variantInputDetail.stocks![idx].quantity}
												type="number"
												disabled={loading}
												min={0}
												variant={stock.quantity % 1 !== 0 ? 'error' : 'info'}
												subText={stock.quantity % 1 !== 0 ? $tranFunc('error.positiveInteger') : ''}
											/>
										{/each}
									</div>
								</div>
							</td>
							<!-- SKU -->
							<td class="sku-td">
								<Input
									type="text"
									size="sm"
									disabled={loading}
									placeholder="SKU"
									bind:value={variantInputDetail.sku}
									variant={variantInputDetail.sku?.trim() ? 'info' : 'error'}
									subText={variantInputDetail.sku?.trim()
										? ''
										: $tranFunc('helpText.fieldRequired')}
								/>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
