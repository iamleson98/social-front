<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Plus, Trash, MdiWeightKg, Icon } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, BUTTON_VARIANT_COLORS_MAP, IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Input, Label } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton } from '$lib/components/ui/select';
	import {
		type ProductChannelListingAddInput,
		type ProductChannelListingUpdateInput,
		type ProductVariantBulkCreateInput,
		type ProductVariantChannelListingAddInput,
		type Query,
		type StockInput,
	} from '$lib/gql/graphql';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { checkIfGraphqlResultHasError, randomString } from '$lib/utils/utils';
	import { slide } from 'svelte/transition';
	import { chunk, flatten, omit } from 'es-toolkit';
	import { CurrencyIconMap, type CurrencyCode } from '$lib/utils/consts';
	import { onMount } from 'svelte';
	import DAYJS from 'dayjs';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Accordion } from '$lib/components/ui/Accordion';
	import ErrorMsg from './error-msg.svelte';
	import { Modal } from '$lib/components/ui/Modal';
	import type {
		ChannelSelectOptionProps,
		CustomStockInput,
		QuickFillHighlight,
		QuickFillingProps,
		VariantManifestProps,
	} from './utils';
	import type { MediaObject } from '$lib/utils/types';

	type Props = {
		productVariantsInput: ProductVariantBulkCreateInput[];
		/** constraint on channel listings */
		channelsListing: ProductChannelListingUpdateInput;
		loading: boolean;

		/**
		 * parent product's media, use for assigning to variants
		 */
		productMedias: MediaObject[];
	};

	const MAX_VARIANT_TYPES = 2;
	const MAX_VALUES_PER_VARIANT = 4;
	const MAX_VALUES_SINGLE_VARIANT = 10;
	// on some platforms, pre-order product will be available in 5-15 days
	const MIN_DAYS_FOR_PREORDER = 5;
	const MAX_DAYS_FOR_PREORDER = 15;
	const DAYJS_NOW = DAYJS();

	const DEFAULT_VARIANTS: VariantManifestProps[] = [
		{ name: { value: 'color' }, values: [{ value: 'red' }] },
	];

	const SECOND_SAMPLE_VARIANT = {
		name: { value: 'size' },
		values: [{ value: 'm' }],
	};

	const VARIANT_ATTRIBUTE_HINTS = [
		{ title: 'product.channelHint' },
		{ title: 'product.priceHint' },
		{ title: 'product.costPriceHint' },
		{ title: 'product.stockHint' },
		{ title: 'product.weightHint' },
		{ title: 'product.skuHint' },
		{
			title: 'product.preorderHint',
			args: { min: MIN_DAYS_FOR_PREORDER, max: MAX_DAYS_FOR_PREORDER },
		},
	];

	let {
		productVariantsInput = $bindable([]),
		channelsListing,
		loading,
		productMedias,
	}: Props = $props();
	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([]);
	let quickFillingHighlightClass = $state<QuickFillHighlight>();
	let variantManifests = $state.raw<VariantManifestProps[]>([]);
	let variantManifestError = $state(false);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true,
	});
	/** contains channel select options, this list depends on the prop `channelsListing` */
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	let showQuickFillingAdvancedSettings = $state(false);
	let openImageModal = $state(false);

	/** check if quick filling form has any error */
	let quickFillingError = $derived.by(() => {
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

	let variantInputDetailError = $derived.by(() => {
		for (const inputItem of variantsInputDetails) {
			if (
				inputItem.channelListings?.some(
					(chan) => typeof chan.preorderThreshold === 'number' && chan.preorderThreshold % 1 !== 0,
				)
			)
				return true;

			if (!inputItem.name?.trim()) return true;

			if (inputItem.preorder) {
				const { globalThreshold, endDate } = inputItem.preorder;
				if (typeof globalThreshold === 'number' && globalThreshold % 1 !== 0) return true;

				if (endDate) {
					try {
						new Date(endDate);
					} catch {
						return true;
					}
				}
			}

			if (inputItem.stocks?.some((stock) => stock.quantity % 1 !== 0)) return true;
		}

		return false;
	});

	/** hold errors of variant manifest form, quick filling form, detail form, if there is any error, display red border for user to know  */
	let hasGeneralError = $derived(
		variantManifestError || quickFillingError || variantInputDetailError,
	);

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		context: { requestPolicy: 'cache-and-network' },
	});

	onMount(() => {
		return channelsQueryStore.subscribe((result) => {
			if (checkIfGraphqlResultHasError(result)) return;

			const warehousesOfChannels: CustomStockInput[] = [];
			const warehouseMeetMap: Record<string, boolean> = {};

			for (const channel of result.data?.channels || []) {
				for (const warehouse of channel.warehouses) {
					if (!warehouseMeetMap[warehouse.id]) {
						warehouseMeetMap[warehouse.id] = true;

						warehousesOfChannels.push({
							warehouse: warehouse.id,
							warehouseName: warehouse.name,
							quantity: 0,
						});
					}
				}
			}

			quickFillingValues = {
				...quickFillingValues,
				stocks: warehousesOfChannels,
			};
		});
	});

	// let parent know about the changes
	$effect(() => {
		productVariantsInput = variantsInputDetails.map((item) => {
			return {
				...item,
				stocks: item.stocks?.map(
					(stock) => omit(stock, ['warehouseName' as keyof StockInput]) as StockInput,
				),
				channelListings: item.channelListings?.map(
					(listing) =>
						omit(listing, [
							'label' as keyof ProductVariantChannelListingAddInput,
							'value' as keyof ProductVariantChannelListingAddInput,
							'currency' as keyof ProductVariantChannelListingAddInput,
						]) as ProductVariantChannelListingAddInput,
				),
			};
		});
	});

	$effect(() => {
		const newChannelSelectOptions: ChannelSelectOptionProps[] = [];

		channelsListing?.updateChannels?.forEach((channelListing) => {
			newChannelSelectOptions.push({
				value: channelListing.channelId,
				label: channelListing['channelName' as keyof ProductChannelListingAddInput],
				currency: channelListing['currency' as keyof ProductChannelListingAddInput],
				channelId: channelListing.channelId,
				price: undefined,
			});
		});

		channelSelectOptions = newChannelSelectOptions;
	});

	const handleFocusHighlightQuickFilling = (highlight?: QuickFillHighlight) =>
		(quickFillingHighlightClass = highlight);

	const handleVariantValueChange = (variantIdx: number, valueIdx: number, evt: Event) => {
		if (!evt.target) return;
		const newValue = (evt.target as HTMLInputElement).value;
		const valueTrimLower = newValue.trim().toLowerCase();

		const valueDuplicate = variantManifests[variantIdx].values.some(
			(value, idx) => idx !== valueIdx && valueTrimLower && valueTrimLower === value.value,
		);

		variantManifestError = !valueTrimLower || valueDuplicate;

		variantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: variant.name,
				values: variant.values.map((value, idx) => {
					if (idx !== valueIdx) return { ...value, error: undefined };

					return {
						value: valueTrimLower,
						error: valueDuplicate
							? $tranFunc('product.variantValueExist', { name: valueTrimLower })
							: !newValue
								? $tranFunc('product.variantValueEmpty')
								: undefined,
					};
				}),
			};
		});
		if (variantManifestError) return;

		if (variantManifests.length === 1) {
			variantsInputDetails = variantsInputDetails.map((detail, idx) => {
				if (idx !== valueIdx) return detail;

				return {
					...detail,
					name: valueTrimLower,
					// sku: `${randomString()}-${valueTrimLower}`
					sku: randomString(),
				};
			});

			return;
		}

		const newVariantDetails = [...variantsInputDetails];

		if (variantIdx === 0) {
			let index = valueIdx * variantManifests[1].values.length;
			const endIndex = (valueIdx + 1) * variantManifests[1].values.length;

			for (; index < endIndex; index++) {
				const existingValue = variantsInputDetails[index];
				const splitName = (existingValue.name || '-').split('-');
				// const newSku = `${randomString()}-${valueTrimLower}-${splitName[1]}`;

				newVariantDetails[index] = {
					...existingValue,
					name: `${valueTrimLower}-${splitName[1]}`,
					// sku: newSku
					sku: randomString(),
				};
			}
		} else {
			for (
				let index = valueIdx;
				index < variantsInputDetails.length;
				index += variantManifests[1].values.length
			) {
				const existingValue = variantsInputDetails[index];
				const splitName = (existingValue.name || '-').split('-');
				// const newSku = `${randomString()}-${splitName[0]}-${valueTrimLower}`;

				newVariantDetails[index] = {
					...existingValue,
					name: `${splitName[0]}-${valueTrimLower}`,
					// sku: newSku
					sku: randomString(),
				};
			}
		}

		variantsInputDetails = newVariantDetails;
	};

	const handleVariantNameChange = (variantIdx: number, evt: Event) => {
		if (!evt.target) return;
		const name = (evt.target as HTMLInputElement).value;
		const nameTrimLower = name.trim().toLowerCase();

		const nameDuplicate = variantManifests.some(
			(variant, idx) =>
				idx !== variantIdx &&
				nameTrimLower &&
				nameTrimLower === variant.name.value.trim().toLocaleLowerCase(),
		);

		variantManifestError = nameDuplicate || !nameTrimLower;
		const newVariants = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: {
					value: nameTrimLower,
					error: nameDuplicate
						? $tranFunc('product.variantNameExist', { name: nameTrimLower })
						: !name
							? $tranFunc('product.variantNameEmpty')
							: undefined,
				},
				values: variant.values,
			};
		});

		variantManifests = newVariants;
	};

	const handleAddVariant = () => {
		if (variantManifests.length >= MAX_VARIANT_TYPES) return;

		if (!variantManifests.length) {
			variantManifests = DEFAULT_VARIANTS;
			variantsInputDetails = DEFAULT_VARIANTS.map((variant) => ({
				name: variant.values[0].value,
				attributes: [],
				sku: `${randomString()}-${variant.values[0].value}`,
				trackInventory: true,
				channelListings: [],
				weight: 0,
				preorder: {},
			}));
			return;
		}

		const newVariants = variantManifests.concat(SECOND_SAMPLE_VARIANT);

		const newVariantDetails: ProductVariantBulkCreateInput[] = [];
		for (const variant1 of newVariants[0].values) {
			for (const variant2 of newVariants[1].values) {
				newVariantDetails.push({
					name: `${variant1.value}-${variant2.value}`,
					attributes: [],
					sku: `${randomString()}-${variant1.value}-${variant2.value}`,
					trackInventory: true,
					channelListings: [],
					weight: 0,
					preorder: {},
				});
			}
		}

		variantManifests = newVariants;
		variantsInputDetails = newVariantDetails;
	};

	const handleDeleteVariant = (variantIdx: number) => {
		variantManifests = variantManifests.filter((_, idx) => idx !== variantIdx);
		if (!variantManifests.length) {
			variantsInputDetails = [];
			return;
		}

		variantsInputDetails = variantManifests[0].values.map((value) => ({
			name: `${value.value}`,
			attributes: [],
			sku: `${randomString()}-${value.value}`,
			trackInventory: true,
			channelListings: [],
			weight: 0,
			preorder: {},
		}));
	};

	const handleAddVariantValue = (variantIdx: number) => {
		const maxValues =
			variantManifests.length === MAX_VARIANT_TYPES
				? MAX_VALUES_PER_VARIANT
				: MAX_VALUES_SINGLE_VARIANT;
		const newVariantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx || variant.values.length >= maxValues) return variant;

			return {
				name: variant.name,
				values: variant.values.concat({ value: '' }),
			};
		});

		if (newVariantManifests.length === 1) {
			variantsInputDetails = variantsInputDetails.concat({
				attributes: [],
				name: '-',
				sku: `${randomString()}-`,
				trackInventory: true,
				channelListings: [],
				weight: 0,
				preorder: {},
			});
		} else {
			if (variantIdx === 1) {
				const chunks = chunk(variantsInputDetails, variantManifests[1].values.length);

				for (let i = 0; i < chunks.length; i++) {
					const siblingValue = chunks[i][0].name || '-';
					const siblingSplitName = siblingValue.split('-');

					chunks[i].push({
						attributes: [],
						name: `${siblingSplitName[0]}-`,
						sku: `${randomString()}-${siblingSplitName[0]}-`,
						trackInventory: true,
						channelListings: [],
						weight: 0,
						preorder: {},
					});
				}
				variantsInputDetails = flatten(chunks);
			} else {
				const addingVariants = variantManifests[1].values.map((value) => ({
					attributes: [],
					name: `-${value.value}`,
					sku: `${randomString()}--${value.value}`,
					trackInventory: true,
					channelListings: [],
					weight: 0,
					preorder: {},
				}));
				variantsInputDetails = variantsInputDetails.concat(addingVariants);
			}
		}
		variantManifests = newVariantManifests;
	};

	const handleDeleteVariantValue = (variantIndex: number, valueIndex: number) => {
		const newVariantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIndex) return variant;

			return {
				name: variant.name,
				values: variant.values.filter((_, idx) => idx !== valueIndex),
			};
		});

		if (variantManifests.length === 1) {
			variantsInputDetails = variantsInputDetails.filter((_, idx) => idx !== valueIndex);
		} else if (variantManifests.length === MAX_VARIANT_TYPES) {
			if (variantIndex === 0) {
				const beginIndex = valueIndex * variantManifests[1].values.length;
				const endIndex = (valueIndex + 1) * variantManifests[1].values.length;

				variantsInputDetails = variantsInputDetails.filter(
					(_, idx) => idx < beginIndex || idx >= endIndex,
				);
			} else {
				const chunks = chunk(variantsInputDetails, variantManifests[1].values.length);
				for (let i = 0; i < chunks.length; i++) {
					chunks[i] = chunks[i].filter((_, idx) => idx !== valueIndex);
				}

				variantsInputDetails = flatten(chunks);
			}
		}

		variantManifests = newVariantManifests;
	};

	const handleQuickFillingClick = () => {
		const canQuickFillingStocks = true; // quickFillingValues.stocks.some((stock) => !!stock.quantity);
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
</script>

<div class="mb-3">
	<Label required requiredAtPos="end" label={$tranFunc('product.variants')} />

	<div class={`rounded-lg w-full border p-3 ${hasGeneralError ? 'bg-red-50 border-red-200' : ''}`}>
		<!-- MARK: Menifest -->
		<div
			class="grid grid-cols-2 gap-2"
			class:items-center={variantManifests.length < MAX_VARIANT_TYPES}
		>
			{#each variantManifests as variant, variantIdx (variantIdx)}
				<div class="p-3 border rounded-lg h-fit">
					<!-- TITLE -->
					<div class="mb-1 text-xs">
						{$tranFunc('product.variant')}
						{variantIdx + 1}
					</div>
					<!-- NAME -->
					<div class="mb-4">
						<label
							class="input input-sm flex items-center gap-2"
							class:input-error={!!variant.name.error}
						>
							<span>{$tranFunc('product.variantName')}</span>
							<Input
								type="text"
								class="w-full"
								placeholder={$tranFunc('product.variantPlaceholder')}
								inputDebounceOption={{
									onInput: (evt) => handleVariantNameChange(variantIdx, evt),
								}}
								value={variant.name.value}
								size="md"
								variant={variant.name.error ? 'error' : 'info'}
								subText={variant.name.error}
								disabled={loading}
							/>
						</label>
					</div>

					<!-- values -->
					{#each variant.values as value, valueIdx (valueIdx)}
						<div class="mb-2" transition:slide>
							<div class="flex items-center justify-between w-full">
								<Input
									variant={value.error ? 'error' : 'info'}
									type="text"
									disabled={loading}
									class="w-4/5"
									size="sm"
									placeholder={$tranFunc('placeholders.valuePlaceholder')}
									inputDebounceOption={{
										onInput: (evt) => handleVariantValueChange(variantIdx, valueIdx, evt),
										debounceTime: 500, // only fire after 0.5 sec after user stop typing
									}}
									value={value.value}
									subText={value.error}
								/>
								{#if variant.values.length > 1}
									<IconButton
										icon={Trash}
										size="xs"
										disabled={loading}
										variant="light"
										rounded
										color="red"
										onclick={() => handleDeleteVariantValue(variantIdx, valueIdx)}
										class="tooltip tooltip-top"
										data-tip={$tranFunc('product.delValue')}
									/>
								{/if}
							</div>
						</div>
					{/each}
					<div class="flex justify-center items-center gap-1.5 mt-4">
						<Button
							endIcon={Trash}
							size="sm"
							disabled={loading}
							variant="light"
							color="red"
							onclick={() => handleDeleteVariant(variantIdx)}
							fullWidth
						>
							{$tranFunc('product.delVariant')}
						</Button>
						<Button
							endIcon={Plus}
							size="sm"
							variant="light"
							color="blue"
							onclick={() => handleAddVariantValue(variantIdx)}
							disabled={variant.values.length >=
								(variantManifests.length === MAX_VARIANT_TYPES
									? MAX_VALUES_PER_VARIANT
									: MAX_VALUES_SINGLE_VARIANT) || loading}
							fullWidth
						>
							{$tranFunc('product.addValue')}
							{variant.values.length}/{variantManifests.length === MAX_VARIANT_TYPES
								? MAX_VALUES_PER_VARIANT
								: MAX_VALUES_SINGLE_VARIANT}
						</Button>
					</div>
				</div>
			{/each}
			{#if variantManifests.length < MAX_VARIANT_TYPES}
				<button
					class={[
						'border-dashed border w-full h-full flex items-center justify-center rounded-lg tooltip tooltip-top border-blue-500 text-blue-500 cursor-pointer py-5 hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50',
					]}
					onclick={handleAddVariant}
					data-tip={$tranFunc('product.addVariant')}
					aria-label={$tranFunc('product.addVariant')}
				>
					<Icon icon={Plus} size="xl" />
				</button>
			{/if}
		</div>

		{#if variantManifests.length}
			<div class="mt-4">
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
									<div
										class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-2 rounded-lg"
									>
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
										class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-1 rounded-lg"
									>
										{#each quickFillingValues.stocks as stockInput, idx (idx)}
											{@const isError = stockInput.quantity % 1 !== 0}
											<div class="flex items-start flex-row gap-1.5 mt-1 odd:bg-gray-100 p-1">
												<span class="w-1/3 text-xs">
													{stockInput.warehouseName}
												</span>
												<Input
													type="number"
													placeholder="quantity"
													min={0}
													class="w-2/3"
													disabled={loading}
													size="xs"
													onfocus={() => handleFocusHighlightQuickFilling('td-stock-hl')}
													bind:value={stockInput.quantity}
													variant={isError ? 'error' : 'info'}
													subText={isError ? $tranFunc('error.positiveInteger') : ''}
												/>
											</div>
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
					<Alert variant="info" size="sm" bordered>
						<ol class="text-xs">
							{#each VARIANT_ATTRIBUTE_HINTS as hint, idx (idx)}
								<li>{idx + 1}. {$tranFunc(hint.title, hint.args)}</li>
							{/each}
						</ol>
					</Alert>
				</div>

				<!-- MARK: DETAILS -->
				<div class="relative h-fit w-full rounded-lg p-3 border border-gray-200 bg-white">
					<table
						class="w-full text-sm h-fit text-left rtl:text-right text-gray-600 dark:text-gray-500 mb-4"
					>
						<thead class="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-500">
							<tr>
								<th>{variantManifests[0].name.value}</th>
								{#if variantManifests.length === MAX_VARIANT_TYPES}
									<th>{variantManifests[1].name.value}</th>
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
								<tr
									class={`variant-table-row ${quickFillingHighlightClass} border-b border-gray-200`}
								>
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
											<!-- <div>
												<IconButton
													icon={PhotoUp}
													size="lg"
													variant="outline"
													class="border-dashed tooltip tooltip-top"
													data-tip="Add photo(s)"
													onclick={() => (openImageModal = true)}
												/>
											</div> -->
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
											subText={variantInputDetail.weight >= 0
												? ''
												: $tranFunc('error.negativeNumber')}
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
											<div class="flex flex-col gap-1">
												{#each variantInputDetail.stocks || [] as stock, idx (idx)}
													<div class="flex items-start gap-2 odd:bg-gray-100 p-1">
														<span class="text-xs w-1/3">
															{stock['warehouseName' as keyof StockInput]}
														</span>
														<Input
															size="xs"
															placeholder={$tranFunc('product.stock')}
															class="w-2/3"
															bind:value={variantInputDetail.stocks![idx].quantity}
															type="number"
															disabled={loading}
															min={0}
															variant={stock.quantity % 1 !== 0 ? 'error' : 'info'}
															subText={stock.quantity % 1 !== 0
																? $tranFunc('error.positiveInteger')
																: ''}
														/>
													</div>
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
			</div>
		{/if}
	</div>
	<ErrorMsg error={hasGeneralError ? $tranFunc('error.thereIsError') : undefined} />
</div>

<Modal
	open={openImageModal}
	header="Choose photos"
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openImageModal = false)}
	onCancel={() => (openImageModal = false)}
	onOk={() => (openImageModal = false)}
>
	{#if productMedias.length > 0}
		<div class="flex gap-1 flex-wrap">
			{#each productMedias as media, idx (idx)}
				<div
					class="h-30 w-30 bg-no-repeat bg-center bg-cover"
					style="background-image: url('{media.url}');"
				></div>
			{/each}
		</div>
	{:else}
		<Alert variant="warning" bordered size="sm">Please add photos for the parent product</Alert>
	{/if}
</Modal>

<style lang="postcss">
	@reference "tailwindcss";

	td {
		@apply p-1 border-transparent border-l border-r;
	}
	th {
		@apply px-1 py-3;
	}

	.variant-table-row:last-child > td {
		@apply border-b;
	}
	.variant-table-row:first-child > td {
		@apply border-t;
	}

	/** price highlight */
	.td-price-hl > .price-td,
	.td-channel-hl > .channel-td,
	.td-stock-hl > .stock-td,
	.td-sku-hl > .sku-td,
	.td-cost-price-hl > .cost-price-td,
	.td-weight-hl > .weight-td,
	.td-preorder-hl > .preorder-td {
		@apply border-blue-500!;
	}

	table,
	tr,
	td {
		border-collapse: initial !important;
	}
</style>
