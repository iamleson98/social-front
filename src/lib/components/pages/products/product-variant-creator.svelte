<script lang="ts">
	import { tClient } from '$i18n';
	import { Plus, Trash, type IconType } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { type SocialColor } from '$lib/components/ui/common';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import type { ProductVariantBulkCreateInput, Query } from '$lib/gql/graphql';
	import { CHANNELS_QUERY_STORE } from '$lib/stores/api/channels';
	import { operationStore } from '$lib/stores/api/operation';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

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

	const MAX_VARIANT_TYPES = 2;
	const MAX_VALUES_PER_VARIANT = 4;

	let quickFilling = $state<QuickFillHighlight>();

	let variants = $state.raw<VariantManifestProps[]>([
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
	]);

	// let variantDetails = $state<ProductVariantBulkCreateInput>([]);

	/** this state is general indicator that if user input variant values still have mistake.
	 * As long as this state is true, the user can't fill the detail pricing table, let alone submit the form
	 */
	let generalError = $state(false);

	const handleFocusQuickFilling = (highlight?: QuickFillHighlight) => {
		quickFilling = highlight;
	};

	const handleVariantValueChange = (variantIdx: number, valueIdx: number) => (evt: Event) => {
		if (!evt.target) return;
		const newValue = (evt.target as HTMLInputElement).value;

		const valueDuplicate = variants[variantIdx].values.some(
			(value, idx) => idx !== valueIdx && newValue && newValue === value.value
		);

		generalError = !newValue || valueDuplicate;
		variants = variants.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: variant.name,
				values: variant.values.map((value, idx) => {
					if (idx !== valueIdx) return value;

					return {
						value: newValue,
						error: valueDuplicate
							? tClient('product.variantValueExist', { name: newValue })
							: !newValue
								? tClient('product.variantValueEmpty')
								: undefined
					};
				})
			};
		});
	};

	const handleVariantNameChange = (variantIdx: number) => (evt: Event) => {
		if (!evt.target) return;

		const name = (evt.target as HTMLInputElement).value;
		const nameTrimLower = name.trim().toLowerCase();

		const nameDuplicate = variants.some(
			(variant, idx) =>
				idx !== variantIdx &&
				nameTrimLower &&
				nameTrimLower === variant.name.value.trim().toLocaleLowerCase()
		);

		generalError = nameDuplicate || !nameTrimLower;
		variants = variants.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: {
					value: name,
					error: nameDuplicate
						? tClient('product.variantNameExist', { name })
						: !name
							? tClient('product.variantNameEmpty')
							: undefined
				},
				values: variant.values
			};
		});
	};

	const handleAddVariant = () => {
		if (variants.length < MAX_VARIANT_TYPES) {
			variants = variants.concat({
				name: {
					value: 'size'
				},
				values: [
					{
						value: 'm'
					}
				]
			});
		}
	};

	const handleDeleteVariant: variantAction = (variantIdx: number) => {
		if (variants.length) {
			variants = variants.filter((_, idx) => idx !== variantIdx);
		}
	};

	const handleAddVariantValue: variantAction = (variantIdx: number) => {
		variants = variants.map((variant, idx) => {
			if (idx !== variantIdx || variant.values.length >= MAX_VALUES_PER_VARIANT) return variant;

			return {
				name: variant.name,
				values: variant.values.concat({ value: '' })
			};
		});
	};

	const handleDeleteValue = (variantIdx: number, valueIdx: number) => {
		variants = variants.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: variant.name,
				values: variant.values.filter((_, idx) => idx !== valueIdx)
			};
		});
	};

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY_STORE,
		context: { requestPolicy: 'cache-and-network' }
	});

	onMount(() => {
		return channelsQueryStore.subscribe(preHandleGraphqlResult);
	});
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

<!-- composer -->
<div
	class="flex gap-2 mobile-l:flex-wrap flex-nowrap bg-gray-50 rounded-lg border border-gray-200 p-3"
	class:items-center={variants.length < MAX_VARIANT_TYPES}
>
	{#each variants as variant, variantIdx (variantIdx)}
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
					`${variants[variantIdx].values.length}/${MAX_VALUES_PER_VARIANT}`,
					Plus
				)}
			</div>
		</div>
	{/each}
	{#if variants.length < MAX_VARIANT_TYPES}
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

{#snippet variantTableRow(indices: number[], values: string[])}
	<tr class={`variant-table-row ${quickFilling || ''}`}>
		{#if indices.length === 1}
			{#if !indices[0]}
				<td
					rowspan={variants[0].values.length}
					class="font-medium text-center border-b border-gray-200"
				>
					{values[0]}
				</td>
			{/if}
		{:else}
			{#if !indices[1]}
				<td
					rowspan={variants[1].values.length}
					class="font-medium text-center border-b border-gray-200"
				>
					{values[0]}
				</td>
			{/if}
			<td class="font-medium text-center border-b border-gray-200">{values[1]}</td>
		{/if}
		<td class="channel-td">
			<Select
				size="xs"
				options={$channelsQueryStore.data?.channels?.map((channel) => ({
					value: channel.slug,
					label: channel.name
				})) || []}
				placeholder="Select channel"
				disabled={$channelsQueryStore.fetching || !!$channelsQueryStore.error}
			/>
		</td>
		<td class="price-td">
			<Input type="text" size="xs" placeholder="price" />
		</td>
		<td class="stock-td">
			<Input type="text" size="xs" placeholder="stock" />
		</td>
		<td class="sku-td">
			<Input type="text" size="xs" placeholder="SKU" value={values.join('-')} />
		</td>
	</tr>
{/snippet}

<!-- detail -->
{#if variants.length && !generalError}
	<div class="mt-10">
		<!-- quick filling -->
		<div class="mb-4">
			<div class="text-xs mb-1">Quick filling</div>
			<div class="flex gap-x-2 items-center flex-row w-full">
				<Select
					disabled={$channelsQueryStore.fetching || !!$channelsQueryStore.error}
					size="sm"
					options={$channelsQueryStore.data?.channels?.map((channel) => ({
						value: channel.slug,
						label: channel.name
					})) || []}
					onfocus={() => handleFocusQuickFilling('td-channel-hl')}
					onblur={() => handleFocusQuickFilling()}
				/>
				<Input
					type="text"
					placeholder="price"
					size="sm"
					onfocus={() => handleFocusQuickFilling('td-price-hl')}
					onblur={() => handleFocusQuickFilling()}
				/>
				<Input
					type="text"
					placeholder="stock"
					size="sm"
					onfocus={() => handleFocusQuickFilling('td-stock-hl')}
					onblur={() => handleFocusQuickFilling()}
				/>
				<Input
					type="text"
					placeholder="SKU"
					size="sm"
					onfocus={() => handleFocusQuickFilling('td-sku-hl')}
					onblur={() => handleFocusQuickFilling()}
				/>
				<Button class="btn btn-sm grow shrink" size="sm">Apply</Button>
			</div>
		</div>

		<!-- details -->
		<div class="relative overflow-x-auto rounded-lg p-3 border border-gray-200 bg-gray-50">
			<table class="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-500 mb-4">
				<thead class="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-500">
					<tr>
						<th>{variants[0].name.value}</th>
						{#if variants.length === MAX_VARIANT_TYPES}
							<th>{variants[1].name.value}</th>
						{/if}
						<th>channel</th>
						<th>price</th>
						<th>stock</th>
						<th>classify sku</th>
					</tr>
				</thead>
				<tbody class="overflow-y-visible">
					{#each variants[0].values as value, valueIdx (valueIdx)}
						{#if variants.length === MAX_VARIANT_TYPES}
							{#each variants[1].values as value2, valueIdx2 (valueIdx2)}
								{@render variantTableRow([valueIdx, valueIdx2], [value.value, value2.value])}
							{/each}
						{:else}
							{@render variantTableRow([valueIdx], [value.value])}
						{/if}
					{/each}
				</tbody>
			</table>

			<!-- document -->
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

<style lang="postcss">
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
