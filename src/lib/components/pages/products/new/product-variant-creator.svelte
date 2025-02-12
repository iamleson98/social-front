<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Plus, Trash, MdiWeightKg } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton, type ButtonProps } from '$lib/components/ui/Button';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { MultiSelect, type SelectOption } from '$lib/components/ui/select';
	import {
		type PreorderSettingsInput,
		type ProductVariantBulkCreateInput,
		type ProductVariantChannelListingAddInput,
		type Query,
		type StockInput
	} from '$lib/gql/graphql';
	import { CHANNELS_QUERY_STORE } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { preHandleErrorOnGraphqlResult, randomString } from '$lib/utils/utils';
	import { slide } from 'svelte/transition';
	import { chunk, flatten } from 'es-toolkit';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { CurrencyIconMap, type CurrencyCode } from '$lib/utils/consts';
	import { onMount } from 'svelte';
	import DAYJS from 'dayjs';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { RequiredAt } from '$lib/components/ui';
	import ErrorMsg from './error-msg.svelte';

	type VariantManifestProps = {
		name: {
			value: string;
			error?: string;
		};
		values: {
			value: string;
			error?: string;
		}[];
	};

	type Props = {
		productVariantsInput: ProductVariantBulkCreateInput[];
	};

	type CustomStockInput = StockInput & { warehouseName: string };
	type ChannelSelectOptionProps = SelectOption &
		ProductVariantChannelListingAddInput & { currency: string };
	type QuickFillHighlight =
		| 'td-channel-hl'
		| 'td-price-hl'
		| 'td-stock-hl'
		| 'td-sku-hl'
		| 'td-cost-price-hl'
		| 'td-weight-hl'
		| 'td-preorder-hl';

	type QuickFillingProps = {
		channels: ChannelSelectOptionProps[];
		/**
		 * Since channels have associated warehouses, so when channels are updated, we need to update the warehouses
		 */
		stocks: CustomStockInput[];
		sku?: string;
		weight?: number;
		preOrder: PreorderSettingsInput;
		trackInventory: boolean;
		quantityLimitPerCustomer?: number;
	};

	const MAX_VARIANT_TYPES = 2;
	const MAX_VALUES_PER_VARIANT = 4;
	// on some platforms, pre-order product will be available in 5-15 days
	const MIN_DAYS_FOR_PREORDER = 5;
	const MAX_DAYS_FOR_PREORDER = 15;
	const DAYJS_NOW = DAYJS();

	const DEFAULT_VARIANTS: VariantManifestProps[] = [
		{ name: { value: 'color' }, values: [{ value: 'red' }] }
	];

	const SECOND_SAMPLE_VARIANT = {
		name: { value: 'size' },
		values: [{ value: 'm' }]
	};

	const VARIANT_ATTRIBUTE_HINTS = [
		'product.channelHint',
		'product.priceHint',
		'product.costPriceHint',
		'product.stockHint',
		'product.weightHint',
		'product.skuHint'
	];

	let { productVariantsInput = $bindable([]) }: Props = $props();
	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([]);
	let quickFillingHighlightClass = $state<QuickFillHighlight>();
	let variantManifests = $state.raw<VariantManifestProps[]>([]);
	let variantManifestError = $state(false);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true
	});
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	let showQuickFillingAdvancedSettings = $state(false);

	/** check if quick filling form has any error */
	let quickFillingError = $derived.by(() => {
		if (quickFillingValues.stocks.some((stock) => stock.quantity % 1 !== 0)) return true;

		const {
			preOrder: { globalThreshold, endDate },
			quantityLimitPerCustomer
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
					(chan) => typeof chan.preorderThreshold === 'number' && chan.preorderThreshold % 1 !== 0
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
		variantManifestError || quickFillingError || variantInputDetailError
	);

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY_STORE,
		context: { requestPolicy: 'network-only' }
	});

	// let parent know about the changes
	$effect(() => {
		productVariantsInput = variantsInputDetails;
	});

	onMount(() => {
		const unsub = channelsQueryStore.subscribe((channelsResult) => {
			if (preHandleErrorOnGraphqlResult(channelsResult) || !channelsResult.data) return;

			const newChannelSelectOptions: ChannelSelectOptionProps[] = [];
			const warehousesOfChannels: CustomStockInput[] = [];
			const warehouseMeetMap: Record<string, boolean> = {};

			channelsResult.data.channels?.forEach((channel) => {
				newChannelSelectOptions.push({
					value: channel.id,
					label: channel.name,
					currency: channel.currencyCode.toUpperCase(),
					channelId: channel.id,
					price: undefined
				});

				for (const warehouse of channel.warehouses) {
					if (!warehouseMeetMap[warehouse.id]) {
						warehouseMeetMap[warehouse.id] = true;

						warehousesOfChannels.push({
							warehouse: warehouse.id,
							warehouseName: warehouse.name,
							quantity: 0
						});
					}
				}
			});

			channelSelectOptions = newChannelSelectOptions;
			quickFillingValues = {
				...quickFillingValues,
				stocks: warehousesOfChannels
			};
		});

		return unsub;
	});

	const handleFocusHighlightQuickFilling = (highlight?: QuickFillHighlight) =>
		(quickFillingHighlightClass = highlight);

	const handleVariantValueChange = (variantIdx: number, valueIdx: number) => (evt: Event) => {
		if (!evt.target) return;
		const newValue = (evt.target as HTMLInputElement).value;
		const valueTrimLower = newValue.trim().toLowerCase();

		const valueDuplicate = variantManifests[variantIdx].values.some(
			(value, idx) => idx !== valueIdx && valueTrimLower && valueTrimLower === value.value
		);

		variantManifestError = !valueTrimLower || valueDuplicate;

		variantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: variant.name,
				values: variant.values.map((value, idx) => {
					if (idx !== valueIdx) return value;

					return {
						value: valueTrimLower,
						error: valueDuplicate
							? $tranFunc('product.variantValueExist', { name: valueTrimLower })
							: !newValue
								? $tranFunc('product.variantValueEmpty')
								: undefined
					};
				})
			};
		});
		if (variantManifestError) return;

		if (variantManifests.length === 1) {
			variantsInputDetails = variantsInputDetails.map((detail, idx) => {
				if (idx !== valueIdx) return detail;

				return {
					...detail,
					name: valueTrimLower,
					sku: `${randomString()}-${valueTrimLower}`
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
				const newSku = `${randomString()}-${valueTrimLower}-${splitName[1]}`;

				newVariantDetails[index] = {
					...existingValue,
					name: `${valueTrimLower}-${splitName[1]}`,
					sku: newSku
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
				const newSku = `${randomString()}-${splitName[0]}-${valueTrimLower}`;

				newVariantDetails[index] = {
					...existingValue,
					name: `${splitName[0]}-${valueTrimLower}`,
					sku: newSku
				};
			}
		}

		variantsInputDetails = newVariantDetails;
	};

	const handleVariantNameChange = (variantIdx: number) => (evt: Event) => {
		if (!evt.target) return;
		const name = (evt.target as HTMLInputElement).value;
		const nameTrimLower = name.trim().toLowerCase();

		const nameDuplicate = variantManifests.some(
			(variant, idx) =>
				idx !== variantIdx &&
				nameTrimLower &&
				nameTrimLower === variant.name.value.trim().toLocaleLowerCase()
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
							: undefined
				},
				values: variant.values
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
				preorder: {}
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
					preorder: {}
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
			preorder: {}
		}));
	};

	const handleAddVariantValue = (variantIdx: number) => {
		const newVariantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx || variant.values.length >= MAX_VALUES_PER_VARIANT) return variant;

			return {
				name: variant.name,
				values: variant.values.concat({ value: '' })
			};
		});

		if (newVariantManifests.length === 1) {
			variantsInputDetails = variantsInputDetails.concat({
				attributes: [],
				name: '-',
				sku: `${randomString()}-`,
				trackInventory: true,
				channelListings: [],
				trackInventory: true,
				weight: 0,
				preorder: {}
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
						preorder: {}
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
					preorder: {}
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
				values: variant.values.filter((_, idx) => idx !== valueIndex)
			};
		});

		if (variantManifests.length === 1) {
			variantsInputDetails = variantsInputDetails.filter((_, idx) => idx !== valueIndex);
		} else if (variantManifests.length === MAX_VARIANT_TYPES) {
			if (variantIndex === 0) {
				const beginIndex = valueIndex * variantManifests[1].values.length;
				const endIndex = (valueIndex + 1) * variantManifests[1].values.length;

				variantsInputDetails = variantsInputDetails.filter(
					(_, idx) => idx < beginIndex || idx >= endIndex
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
							label,
							value,
							currency
						})
					);
				}
				if (canQuickFillingStocks) {
					variantDetail.stocks = quickFillingValues.stocks.map((stock) => ({
						warehouse: stock.warehouse,
						quantity: stock.quantity,
						warehouseName: stock.warehouseName // this field is needed for displaying
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
	<RequiredAt class="text-sm" label={$tranFunc('product.variants')} required pos="end" />

	<div
		class={`rounded-lg w-full border p-3 ${hasGeneralError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
	>
		<!-- MARK: Menifest -->
		<div
			class="flex gap-2 mobile-l:flex-wrap flex-nowrap"
			class:items-center={variantManifests.length < MAX_VARIANT_TYPES}
		>
			{#each variantManifests as variant, variantIdx (variantIdx)}
				<div class="p-3 w-1/2 mobile-l:w-full border rounded-lg bg-white h-fit">
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
									onInput: handleVariantNameChange(variantIdx) as (result: unknown) => void
								}}
								value={variant.name.value}
								size="md"
								variant={variant.name.error ? 'error' : 'info'}
								subText={variant.name.error}
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
									class="w-4/5"
									size="sm"
									placeholder={$tranFunc('placeholders.valuePlaceholder')}
									inputDebounceOption={{
										onInput: handleVariantValueChange(variantIdx, valueIdx) as (
											result: unknown
										) => void,
										debounceTime: 500 // only fire after 0.5 sec after user stop typing
									}}
									value={value.value}
									subText={value.error}
								/>
								{#if variant.values.length > 1}
									<IconButton
										icon={Trash}
										size="xs"
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
							class="tooltip tooltip-top"
							data-tip={$tranFunc('product.delVariant')}
							startIcon={Trash}
							size="sm"
							variant="light"
							color="red"
							onclick={() => handleDeleteVariant(variantIdx)}
							fullWidth
						></Button>
						<Button
							class="tooltip tooltip-top"
							data-tip={$tranFunc('product.addValue')}
							endIcon={Plus}
							size="sm"
							variant="light"
							color="blue"
							onclick={() => handleAddVariantValue(variantIdx)}
							disabled={variant.values.length >= MAX_VALUES_PER_VARIANT}
							fullWidth
						>
							{variant.values.length}/{MAX_VALUES_PER_VARIANT}
						</Button>
					</div>
				</div>
			{/each}
			{#if variantManifests.length < MAX_VARIANT_TYPES}
				<div class="w-1/2 mobile-l:w-full flex items-center justify-center">
					<IconButton
						onclick={handleAddVariant}
						icon={Plus}
						size="xl"
						variant="outline"
						color="blue"
						class="tooltip tooltip-top"
						data-tip={$tranFunc('product.addVariant')}
					/>
				</div>
			{/if}
		</div>

		{#if variantManifests.length}
			<div class="mt-4">
				<!-- MARK: QUICK FILLING -->
				<div class="mb-4 rounded-lg bg-white p-3 border border-gray-200">
					<div class="text-xs mb-1">{$tranFunc('product.quickFilling')}</div>
					<div class="flex gap-x-2 items-start flex-row w-full">
						<div class="w-11/12 flex gap-1 items-start flex-row">
							<!-- CHANNELS -->
							<div class="w-1/6">
								<div class="text-xs">{$tranFunc('product.channel')}</div>
								{#if !channelSelectOptions?.length}
									<SkeletonContainer>
										<Skeleton class="w-full h-4" rounded={false} />
									</SkeletonContainer>
								{:else}
									<MultiSelect
										size="sm"
										options={channelSelectOptions}
										onfocus={() => handleFocusHighlightQuickFilling('td-channel-hl')}
										bind:value={quickFillingValues.channels}
										class="w-full"
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
										class="mb-2"
										bind:value={quickFillingValues.preOrder.globalThreshold}
										variant={typeof quickFillingValues.preOrder.globalThreshold === 'number' &&
										quickFillingValues.preOrder.globalThreshold < 0
											? 'error'
											: 'info'}
										subText={typeof quickFillingValues.preOrder.globalThreshold === 'number' &&
										quickFillingValues.preOrder.globalThreshold < 0
											? $tranFunc('error.negativeNumber')
											: undefined}
										onfocus={() => handleFocusHighlightQuickFilling('td-preorder-hl')}
									/>
									<!-- AVAILABLE DATE -->
									<EaseDatePicker
										size="xs"
										onchange={(date) => (quickFillingValues.preOrder.endDate = date.date)}
										value={quickFillingValues.preOrder.endDate}
										onfocus={() => handleFocusHighlightQuickFilling('td-preorder-hl')}
										label={$tranFunc('product.preOrderEndDate')}
										allowSelectMonthYears={{
											showMonths: true,
											showYears: { min: 2020, max: DAYJS_NOW.year() + 1 }
										}}
										timeConfig={false}
										timeLock={{
											minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
											maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate()
										}}
									/>
								</div>
							</div>
							<!-- STOCK -->
							<div class="w-1/6">
								<div class="text-xs">{$tranFunc('product.stock')}</div>
								{#if !quickFillingValues.stocks.length}
									<SkeletonContainer>
										<Skeleton class="w-full h-4" rounded={false} />
									</SkeletonContainer>
								{:else}
									<div
										class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-1 rounded-lg"
									>
										{#each quickFillingValues.stocks as stockInput, idx (idx)}
											{@const isError = stockInput.quantity < 0 || stockInput.quantity % 1 !== 0}
											<div class="flex items-start flex-row gap-1.5 mt-1 odd:bg-gray-100 p-1">
												<span class="w-1/3 text-xs">
													{stockInput.warehouseName}
												</span>
												<Input
													type="number"
													placeholder="quantity"
													min={0}
													class="w-2/3"
													size="xs"
													onfocus={() => handleFocusHighlightQuickFilling('td-stock-hl')}
													bind:value={stockInput.quantity}
													variant={isError ? 'error' : 'info'}
													subText={isError ? $tranFunc('error.negativeNumber') : ''}
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
								fullWidth
								onclick={handleQuickFillingClick}>{$tranFunc('btn.apply')}</Button
							>
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
									<!-- NAME 1 -->
									<td class="text-center">{variantInputDetail.name?.split('-')[0]}</td>
									{#if variantManifests.length === MAX_VARIANT_TYPES}
										<!-- NAME 2 -->
										<td class="text-center">{variantInputDetail.name?.split('-')[1]}</td>
									{/if}
									<!-- CHANNELS -->
									<td class="channel-td max-w-3xs min-w-28">
										{#if !channelSelectOptions?.length}
											<SkeletonContainer>
												<Skeleton class="w-full h-4" rounded={false} />
											</SkeletonContainer>
										{:else}
											<MultiSelect
												size="sm"
												options={channelSelectOptions}
												bind:value={variantInputDetail.channelListings as unknown as SelectOption[]}
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
												bind:value={variantInputDetail.preorder!.globalThreshold}
												variant={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
												variantInputDetail.preorder.globalThreshold < 0
													? 'error'
													: 'info'}
												subText={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
												variantInputDetail.preorder.globalThreshold < 0
													? $tranFunc('error.negativeNumber')
													: undefined}
											/>
											<EaseDatePicker
												size="xs"
												label={$tranFunc('product.preOrderEndDate')}
												allowSelectMonthYears={{
													showMonths: true,
													showYears: { min: 2020, max: DAYJS_NOW.year() + 1 }
												}}
												timeConfig={false}
												onchange={(date) => (variantInputDetail.preorder!.endDate = date.date)}
												value={{ date: variantInputDetail.preorder!.endDate }}
												class="mb-2"
												timeLock={{
													minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
													maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate()
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
															min={0}
															variant={stock.quantity < 0 ? 'error' : 'info'}
															subText={typeof stock.quantity === 'number' && stock.quantity < 0
																? $tranFunc('error.negativeNumber')
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

					<!-- DOCUMENT -->
					<Alert variant="info" size="sm" bordered>
						<ol class="text-xs">
							{#each VARIANT_ATTRIBUTE_HINTS as hint, idx (idx)}
								<li>{idx + 1}. {$tranFunc(hint)}</li>
							{/each}
						</ol>
					</Alert>
				</div>
			</div>
		{/if}
	</div>
	<ErrorMsg error={hasGeneralError ? $tranFunc('error.thereIsError') : undefined} />
</div>

<style>
	@import 'tailwindcss/theme';

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
	.variant-table-row.td-price-hl > .price-td {
		@apply border-blue-500!;
	}
	.variant-table-row.td-channel-hl > .channel-td {
		@apply border-blue-500!;
	}
	.variant-table-row.td-stock-hl > .stock-td {
		@apply border-blue-500!;
	}
	.variant-table-row.td-sku-hl > .sku-td {
		@apply border-blue-500!;
	}
	.variant-table-row.td-cost-price-hl > .cost-price-td {
		@apply border-blue-500!;
	}
	.variant-table-row.td-weight-hl > .weight-td {
		@apply border-blue-500!;
	}
	.variant-table-row.td-preorder-hl > .preorder-td {
		@apply border-blue-500!;
	}

	table,
	tr,
	td {
		border-collapse: initial !important;
	}
</style>
