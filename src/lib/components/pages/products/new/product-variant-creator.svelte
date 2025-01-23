<script lang="ts">
	import { tClient } from '$i18n';
	import { Plus, Trash, MdiWeightKg } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import {
		MultiSelect,
		type SelectOption,
		type SelectOptionExtends
	} from '$lib/components/ui/select';
	import {
		type ProductVariantBulkCreateInput,
		type ProductVariantChannelListingAddInput,
		type Query,
		type StockInput
	} from '$lib/gql/graphql';
	import { CHANNELS_QUERY_STORE } from '$lib/stores/api/channels';
	import { operationStore } from '$lib/stores/api/operation';
	import { preHandleErrorOnGraphqlResult, randomString } from '$lib/utils/utils';
	import { slide } from 'svelte/transition';
	import { chunk, flatten } from 'lodash-es';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { CurrencyIconMap, type CurrencyCode } from '$lib/utils/consts';
	import { onMount } from 'svelte';
	import { type ButtonProps } from '$lib/components/ui/Button/button.types';

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
	type CustomStockInput = StockInput & { warehouseName: string };
	type ChannelSelectOptionProps = SelectOption & {
		currency: string;
		price: number;
		costPrice: number;
	};
	type QuickFillHighlight =
		| 'td-channel-hl'
		| 'td-price-hl'
		| 'td-stock-hl'
		| 'td-sku-hl'
		| 'td-cost-price-hl';

	type QuickFillingProps = {
		channels: ChannelSelectOptionProps[];
		/**
		 * Since channels have associated warehouses, so when channels are updated, we need to update the warehouses
		 */
		stocks: CustomStockInput[];
		sku?: string;
	};

	const MAX_VARIANT_TYPES = 2;
	const MAX_VALUES_PER_VARIANT = 4;

	const DEFAULT_VARIANTS: VariantManifestProps[] = [
		{
			name: {
				value: 'color'
			},
			values: [
				{
					value: 'red'
				}
			]
		}
	];

	const SECOND_SAMPLE_VARIANT = {
		name: {
			value: 'size'
		},
		values: [
			{
				value: 'm'
			}
		]
	};

	type Props = {
		variantsInputDetails: ProductVariantBulkCreateInput[];
	};

	let { variantsInputDetails = $bindable([]) }: Props = $props();

	let quickFillingHighlight = $state<QuickFillHighlight>();
	let variantManifests = $state.raw<VariantManifestProps[]>([]);
	/** details of product variants, before sending to backend */
	// let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([
	// 	{
	// 		name: DEFAULT_VARIANTS[0].values[0].value,
	// 		attributes: [],
	// 		sku: `${randomString()}-${DEFAULT_VARIANTS[0].values[0].value}`,
	// 		trackInventory: true,
	// 		channelListings: []
	// 	}
	// ]);
	/** indicates if there is error in any of the variant values, names */
	let generalError = $state(false);
	let quickFillingValues = $state<QuickFillingProps>({ channels: [], stocks: [] });
	let channelSelectOptions = $state.raw<SelectOptionExtends[]>([]);

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY_STORE,
		context: { requestPolicy: 'network-only' }
	});

	onMount(() => {
		const unsub = channelsQueryStore.subscribe((channelsResult) => {
			if (preHandleErrorOnGraphqlResult(channelsResult) || !channelsResult.data) return;

			const newChannelSelectOptions: SelectOptionExtends[] = [];
			const warehousesOfChannels: CustomStockInput[] = [];
			const warehouseMeetMap: Record<string, boolean> = {};

			channelsResult.data.channels?.forEach((channel) => {
				newChannelSelectOptions.push({
					value: channel.id,
					label: channel.name,
					currency: channel.currencyCode.toUpperCase()
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
		(quickFillingHighlight = highlight);

	const handleVariantValueChange = (variantIdx: number, valueIdx: number) => (evt: Event) => {
		if (!evt.target) return;
		const newValue = (evt.target as HTMLInputElement).value;
		const valueTrimLower = newValue.trim().toLowerCase();

		const valueDuplicate = variantManifests[variantIdx].values.some(
			(value, idx) => idx !== valueIdx && valueTrimLower && valueTrimLower === value.value
		);

		generalError = !valueTrimLower || valueDuplicate;

		variantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: variant.name,
				values: variant.values.map((value, idx) => {
					if (idx !== valueIdx) return value;

					return {
						value: valueTrimLower,
						error: valueDuplicate
							? tClient('product.variantValueExist', { name: valueTrimLower })
							: !newValue
								? tClient('product.variantValueEmpty')
								: undefined
					};
				})
			};
		});
		if (generalError) return;

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

		generalError = nameDuplicate || !nameTrimLower;
		const newVariants = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: {
					value: nameTrimLower,
					error: nameDuplicate
						? tClient('product.variantNameExist', { name: nameTrimLower })
						: !name
							? tClient('product.variantNameEmpty')
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
				channelListings: []
			}));
			return;
		}

		const newVariants = variantManifests.concat(SECOND_SAMPLE_VARIANT);

		const newVariantDetails = [];
		for (const variant1 of newVariants[0].values) {
			for (const variant2 of newVariants[1].values) {
				newVariantDetails.push({
					name: `${variant1.value}-${variant2.value}`,
					attributes: [],
					sku: `${randomString()}-${variant1.value}-${variant2.value}`,
					trackInventory: true,
					channelListings: []
				});
			}
		}

		variantManifests = newVariants;
		variantsInputDetails = newVariantDetails;
	};

	const handleDeleteVariant = (variantIdx: number) => {
		const newVariantManifests = variantManifests.filter((_, idx) => idx !== variantIdx);
		if (!newVariantManifests.length) {
			variantManifests = [];
			variantsInputDetails = [];
			return;
		}

		variantManifests = newVariantManifests;
		variantsInputDetails = newVariantManifests[0].values.map((value) => ({
			name: `${value.value}`,
			attributes: [],
			sku: `${randomString()}-${value.value}`,
			trackInventory: true,
			channelListings: []
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
				trackInventory: true
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
						channelListings: []
					});
				}
				variantsInputDetails = flatten(chunks);
			} else {
				const addingVariants = variantManifests[1].values.map((value) => ({
					attributes: [],
					name: `-${value.value}`,
					sku: `${randomString()}--${value.value}`,
					trackInventory: true,
					channelListings: []
				}));
				variantsInputDetails = variantsInputDetails.concat(addingVariants);
			}
		}
		variantManifests = newVariantManifests;
	};

	const handleDeleteValue = (variantIndex: number, valueIndex: number) => {
		const newVariantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIndex) return variant;

			return {
				name: variant.name,
				values: variant.values.filter((_, idx) => idx !== valueIndex)
			};
		});

		if (variantIndex === 0) {
			const beginIndex = valueIndex * variantManifests[1].values.length;
			const endIndex = (valueIndex + 1) * variantManifests[1].values.length;

			variantsInputDetails = variantsInputDetails.filter(
				(_, idx) => idx < beginIndex || idx >= endIndex
			);
		} else {
			variantsInputDetails = variantsInputDetails.filter(
				(_, idx) => idx % variantManifests[1].values.length !== valueIndex
			);
		}

		variantManifests = newVariantManifests;
	};

	const handleQuickFillingClick = () => {
		const canQuickFillingStocks = true; // quickFillingValues.stocks.some((stock) => !!stock.quantity);
		const canQuickFillingChannels = quickFillingValues.channels.length > 0;

		if (canQuickFillingChannels || canQuickFillingStocks) {
			variantsInputDetails = variantsInputDetails.map((variantDetail) => {
				const result = { ...variantDetail };
				if (canQuickFillingChannels) {
					result.channelListings = quickFillingValues.channels.map((option) => ({
						channelId: option.value as string,
						price: option.price,
						costPrice: option.costPrice,

						// we need those 2 fields for multiselect binding
						label: option.label,
						value: option.value,
						currency: option.currency
					}));
				}
				if (canQuickFillingStocks) {
					result.stocks = quickFillingValues.stocks.map((stock) => ({
						warehouse: stock.warehouse,
						quantity: stock.quantity,
						warehouseName: stock.warehouseName // this field is needed for displaying
					}));
				}

				return result;
			});
		}
	};
</script>

{#snippet variantActionButton({ title, text = '', ...rest }: ButtonProps & { text?: string })}
	<div class="tooltip grow shrink" data-tip={title}>
		<Button {...rest}>
			{text}
		</Button>
	</div>
{/snippet}

<div class="mb-3">
	<span class="text-sm">{tClient('product.variants')}</span>
	<!-- COMPOSER -->
	<div
		class="flex gap-2 mobile-l:flex-wrap flex-nowrap bg-gray-50 rounded-lg border border-gray-200 p-3"
		class:items-center={variantManifests.length < MAX_VARIANT_TYPES}
	>
		{#each variantManifests as variant, variantIdx (variantIdx)}
			<div class="p-3 w-1/2 mobile-l:w-full border rounded-lg bg-white h-fit">
				<!-- TITLE -->
				<div class="mb-1 text-xs">
					{tClient('product.variant')}
					{variantIdx + 1}
				</div>
				<!-- NAME -->
				<div class="mb-4">
					<label
						class="input input-sm flex items-center gap-2"
						class:input-error={!!variant.name.error}
					>
						<span>{tClient('product.variantName')}</span>
						<Input
							type="text"
							class="w-full"
							placeholder={tClient('product.variantPlaceholder')}
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
								placeholder={tClient('product.valuePlaceholder')}
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
									onclick={() => handleDeleteValue(variantIdx, valueIdx)}
									title={tClient('product.delValue')}
								/>
							{/if}
						</div>
					</div>
				{/each}
				<div class="flex justify-center items-center gap-1.5 mt-4">
					{@render variantActionButton({
						title: tClient('product.delVariant'),
						onclick: () => handleDeleteVariant(variantIdx),
						color: 'red',
						endIcon: Trash,
						variant: 'light',
						size: 'sm',
						fullWidth: true
					})}
					{@render variantActionButton({
						title: tClient('product.addValue'),
						onclick: () => handleAddVariantValue(variantIdx),
						color: 'blue',
						endIcon: Plus,
						variant: 'light',
						disabled: variant.values.length >= MAX_VALUES_PER_VARIANT,
						text: `${variantManifests[variantIdx].values.length}/${MAX_VALUES_PER_VARIANT}`,
						size: 'sm',
						fullWidth: true
					})}
				</div>
			</div>
		{/each}
		{#if variantManifests.length < MAX_VARIANT_TYPES}
			<div class="w-1/2 mobile-l:w-full flex items-center justify-center">
				<div class="tooltip" data-tip={tClient('product.addVariant')}>
					<IconButton
						onclick={handleAddVariant}
						icon={Plus}
						size="xl"
						variant="outline"
						color="blue"
					/>
				</div>
			</div>
		{/if}
	</div>

	{#if variantManifests.length && !generalError}
		<div class="mt-10">
			<!-- QUICK FILLING -->
			<div class="mb-4">
				<div class="text-xs mb-1">{tClient('product.quickFilling')}</div>
				<div class="flex gap-x-2 items-start flex-row w-full">
					<!-- CHANNELS -->
					<div class="w-2/7">
						<div class="text-xs">{tClient('product.channel')}</div>
						{#if !channelSelectOptions?.length}
							<SkeletonContainer>
								<Skeleton class="w-full h-4" rounded={false} />
							</SkeletonContainer>
						{:else}
							<MultiSelect
								size="sm"
								options={channelSelectOptions}
								onfocus={() => handleFocusHighlightQuickFilling('td-channel-hl')}
								onblur={() => handleFocusHighlightQuickFilling()}
								bind:value={quickFillingValues.channels}
								class="w-full"
							/>
						{/if}
					</div>
					<!-- PRICING -->
					<div class="w-2/7">
						{#if quickFillingValues.channels.length}
							<div class="flex flex-row text-xs">
								<span class="w-1/2">{tClient('product.price')}</span>
								<span class="w-1/2">{tClient('product.costPrice')}</span>
							</div>
							<div class="max-h-20 overflow-y-auto border border-gray-200 p-2 rounded-lg">
								{#each quickFillingValues.channels as channel, idx (idx)}
									{@const iconType = CurrencyIconMap[channel.currency as CurrencyCode]}
									<div class="flex gap-1 mt-1">
										<Input
											startIcon={iconType}
											type="number"
											placeholder={channel.currency}
											size="xs"
											class="w-1/2"
											bind:value={channel.price}
											variant={channel.price < 0 ? 'error' : 'info'}
											subText={channel.price < 0 ? tClient('error.negativeNumber') : ''}
											onfocus={() => handleFocusHighlightQuickFilling('td-price-hl')}
											onblur={() => handleFocusHighlightQuickFilling()}
										/>
										<Input
											startIcon={iconType}
											type="number"
											placeholder={channel.currency}
											size="xs"
											class="w-1/2"
											bind:value={channel.costPrice}
											variant={channel.costPrice < 0 ? 'error' : 'info'}
											subText={channel.costPrice < 0 ? tClient('error.negativeNumber') : ''}
											onfocus={() => handleFocusHighlightQuickFilling('td-cost-price-hl')}
											onblur={() => handleFocusHighlightQuickFilling()}
										/>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<!-- STOCK -->
					<div class="w-2/7">
						<div class="text-xs">{tClient('product.stock')}</div>
						{#if !quickFillingValues.stocks.length}
							<SkeletonContainer>
								<Skeleton class="w-full h-4" rounded={false} />
							</SkeletonContainer>
						{:else}
							<div class="max-h-20 overflow-y-auto border border-gray-200 p-2 rounded-lg">
								{#each quickFillingValues.stocks as stockInput, idx (idx)}
									<div class="flex items-start flex-row gap-1.5 mt-1">
										<span class="w-1/3 text-sm">
											{stockInput.warehouseName}
										</span>
										<Input
											type="number"
											placeholder="quantity"
											class="w-2/3"
											size="xs"
											onfocus={() => handleFocusHighlightQuickFilling('td-stock-hl')}
											onblur={() => handleFocusHighlightQuickFilling()}
											bind:value={stockInput.quantity}
											variant={stockInput.quantity < 0 ? 'error' : 'info'}
											subText={stockInput.quantity < 0 ? tClient('error.negativeNumber') : ''}
										/>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<!-- APPLY BUTTON -->
					<div class="w-1/7">
						<div class="text-xs">{tClient('common.action')}</div>
						<Button
							class="btn btn-sm grow shrink"
							size="sm"
							fullWidth
							onclick={handleQuickFillingClick}>{tClient('btn.apply')}</Button
						>
					</div>
				</div>
			</div>

			<!-- DETAILS -->
			<div class="relative overflow-x-auto rounded-lg p-3 border border-gray-200 bg-gray-50">
				<table
					class="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-500 mb-4"
				>
					<thead class="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-500">
						<tr>
							<th>{variantManifests[0].name.value}</th>
							{#if variantManifests.length === MAX_VARIANT_TYPES}
								<th>{variantManifests[1].name.value}</th>
							{/if}
							<th>{tClient('product.channel')}</th>
							<th>{tClient('product.price')}</th>
							<th>{tClient('product.costPrice')}</th>
							<th>{tClient('product.stock')}</th>
							<th>{tClient('product.weight')}</th>
							<th>{tClient('product.sku')}</th>
						</tr>
					</thead>
					<tbody class="overflow-y-visible">
						{#each variantsInputDetails as variantInputDetail, detailIdx (detailIdx)}
							<tr class={`variant-table-row ${quickFillingHighlight} border-b border-gray-200`}>
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
											bind:value={
												variantsInputDetails[detailIdx]
													.channelListings as unknown as SelectOptionExtends[]
											}
										/>
									{/if}
								</td>
								<!-- PRICE -->
								<td class="price-td">
									<div class="max-h-28 overflow-y-auto p-1">
										<div class="flex flex-col gap-1">
											{#each variantInputDetail.channelListings! as channelListing, idx (idx)}
												{@const iconType =
													CurrencyIconMap[
														channelListing['currency' as keyof ProductVariantChannelListingAddInput]
													]}
												<Input
													startIcon={iconType}
													type="number"
													size="xs"
													placeholder={channelListing[
														'currency' as keyof ProductVariantChannelListingAddInput
													]}
													bind:value={variantsInputDetails[detailIdx].channelListings![idx].price}
													variant={channelListing.price < 0 ? 'error' : 'info'}
													subText={typeof channelListing.price === 'number' &&
													channelListing.price < 0
														? tClient('error.negativeNumber')
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
											{#each variantInputDetail.channelListings! as channelListing, idx (idx)}
												{@const iconType =
													CurrencyIconMap[
														channelListing['currency' as keyof ProductVariantChannelListingAddInput]
													]}
												<Input
													startIcon={iconType}
													type="number"
													size="xs"
													placeholder={channelListing[
														'currency' as keyof ProductVariantChannelListingAddInput
													]}
													bind:value={
														variantsInputDetails[detailIdx].channelListings![idx].costPrice
													}
													variant={channelListing.costPrice < 0 ? 'error' : 'info'}
													subText={typeof channelListing.costPrice === 'number' &&
													channelListing.costPrice < 0
														? tClient('error.negativeNumber')
														: ''}
												/>
											{/each}
										</div>
									</div>
								</td>
								<!-- STOCK -->
								<td class="stock-td">
									<div class="max-h-28 overflow-y-auto p-1">
										<div class="flex flex-col gap-1">
											{#each variantInputDetail.stocks || [] as stock, idx (idx)}
												<div class="flex items-start gap-2">
													<span class="text-xs w-1/3">
														{stock['warehouseName' as keyof StockInput]}
													</span>
													<Input
														size="xs"
														placeholder={tClient('product.stock')}
														class="w-2/3"
														bind:value={variantsInputDetails[detailIdx].stocks![idx].quantity}
														type="number"
														variant={stock.quantity < 0 ? 'error' : 'info'}
														subText={typeof stock.quantity === 'number' && stock.quantity < 0
															? tClient('error.negativeNumber')
															: ''}
													/>
												</div>
											{/each}
										</div>
									</div>
								</td>
								<!-- WEIGHT -->
								<td class="weight-td">
									<Input
										type="number"
										size="sm"
										placeholder="kg"
										startIcon={MdiWeightKg}
										bind:value={variantsInputDetails[detailIdx].weight}
										variant={variantInputDetail.weight >= 0 ? 'info' : 'error'}
										subText={variantInputDetail.weight >= 0 ? '' : tClient('error.negativeNumber')}
									/>
								</td>
								<!-- SKU -->
								<td class="sku-td">
									<Input
										type="text"
										size="sm"
										placeholder="SKU"
										bind:value={variantsInputDetails[detailIdx].sku}
										variant={variantInputDetail.sku?.trim() ? 'info' : 'error'}
										subText={variantInputDetail.sku?.trim()
											? ''
											: tClient('helpText.fieldRequired')}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- DOCUMENT -->
				<Alert variant="info" size="sm" bordered>
					<div class="text-xs">
						<p>- Choose a channel you would like to sell this product.</p>
						<p>- Provide pricing information for product variants</p>
						<p>- Provide stock information for product variants</p>
						<p>- Fill the classify sku for each product variant.</p>
					</div>
				</Alert>
			</div>
		</div>
	{/if}
</div>

<style>
	@import 'tailwindcss/theme';

	td {
		@apply p-1;
	}
	th {
		@apply px-1 py-3;
	}
	/* highlight price */
	.variant-table-row.td-price-hl .price-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-price-hl:first-child > .price-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-price-hl:last-child > .price-td {
		@apply border-b border-blue-500;
	}

	/* highlight cost price */
	.variant-table-row.td-cost-price-hl .cost-price-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-cost-price-hl:first-child > .cost-price-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-cost-price-hl:last-child > .cost-price-td {
		@apply border-b border-blue-500;
	}

	/* highlight channel */
	.variant-table-row.td-channel-hl .channel-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-channel-hl:first-child > .channel-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-channel-hl:last-child > .channel-td {
		@apply border-b border-blue-500;
	}

	/* highlight stock */
	.variant-table-row.td-stock-hl .stock-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-stock-hl:first-child > .stock-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-stock-hl:last-child > .stock-td {
		@apply border-b border-blue-500;
	}

	/* highlight sku */
	.variant-table-row.td-sku-hl .sku-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-sku-hl:first-child > .sku-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-sku-hl:last-child > .sku-td {
		@apply border-b border-blue-500;
	}
</style>
