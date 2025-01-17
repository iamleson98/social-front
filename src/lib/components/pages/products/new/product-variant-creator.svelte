<script lang="ts">
	import { tClient } from '$i18n';
	import { Plus, Trash, type IconType } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { type SocialColor } from '$lib/components/ui/common';
	import { Input } from '$lib/components/ui/Input';
	import { MultiSelect, type SelectOption } from '$lib/components/ui/select';
	import type {
		ProductVariantBulkCreateInput,
		ProductVariantChannelListingAddInput,
		Query
	} from '$lib/gql/graphql';
	import { CHANNELS_QUERY_STORE } from '$lib/stores/api/channels';
	import { operationStore } from '$lib/stores/api/operation';
	import { preHandleErrorOnGraphqlResult, randomString } from '$lib/utils/utils';
	import { slide } from 'svelte/transition';
	import { chunk, flatten } from 'lodash-es';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { type SelectOptionExtends } from '$lib/components/ui/select/types';
	import { CurrencyIconMap } from '$lib/utils/consts';

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
	type variantAction = (variantIdx: number) => void;
	type QuickFillHighlight = 'td-channel-hl' | 'td-price-hl' | 'td-stock-hl' | 'td-sku-hl';

	type QuickFillingProps = {
		channels: SelectOptionExtends[];
		stock?: number;
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

	let quickFillingHighlight = $state<QuickFillHighlight>();
	let variantManifests = $state.raw<VariantManifestProps[]>(DEFAULT_VARIANTS);
	/** details of product variants, before sending to backend */
	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([
		{
			name: DEFAULT_VARIANTS[0].values[0].value,
			attributes: [],
			sku: `${randomString()}-${DEFAULT_VARIANTS[0].values[0].value}`,
			trackInventory: true,
			channelListings: []
		}
	]);
	/** indicates if there is error in any of the variant values, names */
	let generalError = $state(false);
	let quickFillingValues = $state<QuickFillingProps>({ channels: [] });

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY_STORE,
		context: { requestPolicy: 'network-only' }
	});

	const channelOptions = $derived.by(() => {
		if (
			$channelsQueryStore.fetching ||
			preHandleErrorOnGraphqlResult($channelsQueryStore) ||
			!$channelsQueryStore.data
		)
			return [];

		return $channelsQueryStore.data.channels?.map((channel) => ({
			value: channel.id,
			label: channel.name,
			currency: channel.currencyCode.toUpperCase()
		}));
	});

	const handleFocusHighlightQuickFilling = (highlight?: QuickFillHighlight) => {
		quickFillingHighlight = highlight;
	};

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

		const newVariants = variantManifests.concat({
			name: {
				value: 'size'
			},
			values: [
				{
					value: 'm'
				}
			]
		});

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

	const handleDeleteVariant: variantAction = (variantIdx: number) => {
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

	const handleAddVariantValue: variantAction = (variantIdx: number) => {
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
				channelListings: []
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
		if (quickFillingValues.channels.length) {
			variantsInputDetails = variantsInputDetails.map((variantDetail) => {
				return {
					...variantDetail,
					channelListings: quickFillingValues.channels.map((option) => ({
						channelId: option.value as string,
						price: 0,

						// we need those 2 fields for multiselect binding
						label: option.label,
						value: option.value,
						currency: option.currency
					}))
				};
			});
		}
	};
</script>

{#snippet variantActionButton(
	tip: string,
	variantIdx: number,
	onclick: variantAction,
	disabled: boolean,
	color: SocialColor,
	text: string,
	endIcon: IconType
)}
	<div class="tooltip grow shrink" data-tip={tip}>
		<Button
			{disabled}
			onclick={() => onclick(variantIdx)}
			variant="light"
			{color}
			fullWidth
			size="sm"
			{endIcon}
		>
			{text}
		</Button>
	</div>
{/snippet}

<div class="mb-3">
	<span class="text-sm">{tClient('product.variants')}</span>
	<!-- composer -->
	<div
		class="flex gap-2 mobile-l:flex-wrap flex-nowrap bg-gray-50 rounded-lg border border-gray-200 p-3"
		class:items-center={variantManifests.length < MAX_VARIANT_TYPES}
	>
		{#each variantManifests as variant, variantIdx (variantIdx)}
			<div class="p-3 w-1/2 mobile-l:w-full border rounded-lg bg-white h-fit">
				<!-- title -->
				<div class="mb-1 text-xs">
					{tClient('product.variant')}
					{variantIdx + 1}
				</div>
				<!-- name -->
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
						<div class="flex items-center justify-between">
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
					{@render variantActionButton(
						tClient('product.delVariant'),
						variantIdx,
						handleDeleteVariant,
						false,
						'red',
						'',
						Trash
					)}
					{@render variantActionButton(
						tClient('product.addValue'),
						variantIdx,
						handleAddVariantValue,
						variant.values.length >= MAX_VALUES_PER_VARIANT,
						'blue',
						`${variantManifests[variantIdx].values.length}/${MAX_VALUES_PER_VARIANT}`,
						Plus
					)}
				</div>
			</div>
		{/each}
		{#if variantManifests.length < MAX_VARIANT_TYPES}
			<div class="w-1/2 mobile-l:w-full">
				<div
					class="tooltip w-full h-full flex items-center justify-center"
					data-tip={tClient('product.addVariant')}
				>
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
				<div class="text-xs mb-1">Quick filling</div>
				<div class="flex gap-x-2 items-start flex-row w-full">
					<div class="w-1/4">
						{#if !channelOptions?.length}
							<SkeletonContainer>
								<Skeleton class="w-full h-4" rounded={false} />
							</SkeletonContainer>
						{:else}
							<MultiSelect
								size="sm"
								options={channelOptions as SelectOption[]}
								onfocus={() => handleFocusHighlightQuickFilling('td-channel-hl')}
								onblur={() => handleFocusHighlightQuickFilling()}
								bind:value={quickFillingValues.channels}
							/>
						{/if}
					</div>
					<div class="w-1/4">
						<Input
							type="number"
							placeholder="stock"
							size="sm"
							onfocus={() => handleFocusHighlightQuickFilling('td-stock-hl')}
							onblur={() => handleFocusHighlightQuickFilling()}
							bind:value={quickFillingValues.stock}
							variant={typeof quickFillingValues.stock === 'number' && quickFillingValues.stock < 0
								? 'error'
								: 'info'}
							subText={typeof quickFillingValues.stock === 'number' && quickFillingValues.stock < 0
								? tClient('error.negativeNumber')
								: ''}
						/>
					</div>
					<div class="w-1/4">
						<Input
							type="text"
							placeholder="SKU"
							size="sm"
							onfocus={() => handleFocusHighlightQuickFilling('td-sku-hl')}
							onblur={() => handleFocusHighlightQuickFilling()}
							bind:value={quickFillingValues.sku}
						/>
					</div>
					<div class="w-1/4">
						<Button
							class="btn btn-sm grow shrink"
							size="sm"
							fullWidth
							onclick={handleQuickFillingClick}>Apply</Button
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
							<th>channel</th>
							<th>price</th>
							<th>stock</th>
							<th>classify sku</th>
						</tr>
					</thead>
					<tbody class="overflow-y-visible">
						{#each variantsInputDetails as variantInputDetail, detailIdx (detailIdx)}
							<tr class={`variant-table-row ${quickFillingHighlight}`}>
								<td class="text-center">{variantInputDetail.name?.split('-')[0]}</td>
								{#if variantManifests.length === MAX_VARIANT_TYPES}
									<td class="text-center">{variantInputDetail.name?.split('-')[1]}</td>
								{/if}
								<td class="channel-td max-w-3xs min-w-28">
									{#if !channelOptions?.length}
										<SkeletonContainer>
											<Skeleton class="w-full h-4" rounded={false} />
										</SkeletonContainer>
									{:else}
										{@const options =
											variantInputDetail.channelListings?.map((item) => ({
												value: item.channelId,
												label: item.channelId
											})) || ([] as SelectOption[])}
										<MultiSelect
											size="sm"
											options={channelOptions as SelectOption[]}
											bind:value={
												variantInputDetail.channelListings as unknown as SelectOptionExtends[]
											}
										/>
									{/if}
								</td>
								<td class="price-td flex flex-col gap-1.5">
									{#each variantInputDetail.channelListings || [] as channelListing, idx (idx)}
										{@const iconType = CurrencyIconMap[channelListing['currency' as keyof ProductVariantChannelListingAddInput]]}
										<Input startIcon={iconType} type="number" size="xs" placeholder="price" />
									{/each}
								</td>
								<td class="stock-td">
									<Input type="text" size="sm" placeholder="stock" />
								</td>
								<td class="sku-td">
									<Input type="text" size="sm" placeholder="SKU" value={variantInputDetail.sku} />
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
