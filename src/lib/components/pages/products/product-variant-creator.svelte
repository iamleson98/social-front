<script lang="ts">
	import { tClient } from '$i18n';
	import { Icon, Plus, Trash } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { type SocialColor } from '$lib/components/ui/common';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import type { Query, QueryChannelArgs } from '$lib/gql/graphql';
	import { CHANNELS_QUERY_STORE } from '$lib/stores/api/channels';
	import { operationStore } from '$lib/stores/api/operation';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	type Variant = {
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

	const MAX_VARIANT_TYPES = 2;
	const MAX_VALUES_PER_VARIANT = 4;

	let variants = $state.raw<Variant[]>([
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
	/** this state is general indicator that if user input variant values still have mistake.
	 * As long as this state is true, the user can't fill the detail pricing table, let alone submit the form
	 */
	let generalError = $state(false);

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

		const nameDuplicate = variants.some(
			(variant, idx) => idx !== variantIdx && name && name === variant.name.value
		);

		generalError = nameDuplicate || !name;
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
	action: 'add' | 'delete',
	variantIdx: number,
	onclick: variantAction,
	disabled: boolean,
	color: SocialColor
)}
	<div class="tooltip grow shrink" data-tip={tip}>
		<Button
			{disabled}
			onclick={() => onclick(variantIdx)}
			variant="light"
			{color}
			fullWidth
			size="sm"
		>
			{#if action === 'add'}
				{variants[variantIdx].values.length}/{MAX_VALUES_PER_VARIANT}
				<Icon icon={Plus} />
			{:else}
				<Icon icon={Trash} />
			{/if}
		</Button>
	</div>
{/snippet}

<!-- composer -->
<div
	class="flex gap-2 mobile-l:flex-wrap flex-nowrap bg-gray-50 rounded-lg border border-gray-200 p-3"
	class:items-center={variants.length < MAX_VARIANT_TYPES}
>
	{#each variants as variant, variantIdx (variantIdx)}
		<div class="p-3 w-1/2 mobile-l:w-full border rounded-lg bg-white">
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
					'delete',
					variantIdx,
					handleDeleteVariant,
					false,
					'red'
				)}
				{@render variantActionButton(
					tClient('product.addValue'),
					'add',
					variantIdx,
					handleAddVariantValue,
					variant.values.length >= MAX_VALUES_PER_VARIANT,
					'blue'
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
	<tr>
		{#if indices.length === 1}
			{#if !indices[0]}
				<td
					rowspan={variants[0].values.length}
					class="font-medium text-center border-b border-gray-200">{values[0]}</td
				>
			{/if}
		{:else}
			{#if !indices[1]}
				<td
					rowspan={variants[1].values.length}
					class="font-medium text-center border-b border-gray-200"
					>{values[0]}
				</td>
			{/if}
			<td class="font-medium text-center border-b border-gray-200">{values[1]}</td>
		{/if}
		<td>
			<!-- <Input type="text" size="sm" placeholder="Enter channel" /> -->
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
		<td>
			<Input type="text" size="xs" placeholder="Enter value" />
		</td>
		<td>
			<Input type="text" size="xs" placeholder="Enter value" />
		</td>
		<td>
			<Input type="text" size="xs" placeholder="Enter value" value={values.join('-')} />
		</td>
	</tr>
{/snippet}

<!-- detail -->
{#if variants.length && !generalError}
	<div class="mt-10">
		<!-- shortcut -->
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
				/>
				<Input type="text" placeholder="General price" size="sm" />
				<Input type="text" placeholder="Stocks" size="sm" />
				<Input type="text" placeholder="Pricing" size="sm" />
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
</style>
