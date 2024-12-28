<script lang="ts">
	import { tClient } from '$i18n';
	import { debounceInput } from '$lib/actions/input-debounce';
	import { Icon, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { tick } from 'svelte';
	import { fly, slide } from 'svelte/transition';

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
		if (evt.target) {
			const newValue = (evt.target as HTMLInputElement).value.trim().toLowerCase();

			const valueDuplicate = variants[variantIdx].values.some(
				(value, idx) => idx !== valueIdx && newValue && newValue === value.value
			);

			generalError = !newValue || valueDuplicate;
			variants = variants.map((variant, idx) => {
				if (idx === variantIdx) {
					return {
						name: variant.name,
						values: variant.values.map((value, idx) => {
							if (idx === valueIdx) {
								return {
									value: newValue,
									error: valueDuplicate
										? tClient('product.variantValueExist', { name: newValue })
										: !newValue
											? tClient('product.variantValueEmpty')
											: undefined
								};
							}

							return value;
						})
					};
				}

				return variant;
			});

			tick();
		}
	};

	const handleVariantNameChange = (variantIdx: number) => (evt: Event) => {
		if (evt.target) {
			const name = (evt.target as HTMLInputElement).value.trim().toLowerCase();

			const nameDuplicate = variants.some(
				(variant, idx) => idx !== variantIdx && name && name === variant.name.value
			);

			generalError = nameDuplicate || !name;
			variants = variants.map((variant, idx) => {
				if (idx === variantIdx) {
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
				}
				return variant;
			});

			tick();
		}
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
			if (idx === variantIdx) {
				if (variant.values.length >= MAX_VALUES_PER_VARIANT) {
					return variant;
				}
				return {
					name: variant.name,
					values: variant.values.concat({ value: '' })
				};
			}
			return variant;
		});
	};

	type variantAction = (variantIdx: number) => void;

	const handleDeleteValue = (variantIdx: number, valueIdx: number) => {
		variants = variants.map((variant, idx) => {
			if (idx === variantIdx) {
				return {
					name: variant.name,
					values: variant.values.filter((_, idx) => idx !== valueIdx)
				};
			}
			return variant;
		});
	};
</script>

{#snippet variantError(message?: string)}
	{#if message}
		<span class="text-red-500 text-xs" transition:fly>{message}</span>
	{/if}
{/snippet}

{#snippet variantActionButton(
	tip: string,
	action: 'add' | 'delete',
	variantIdx: number,
	onclick: variantAction,
	disabled: boolean = false
)}
	<div class="tooltip grow shrink" data-tip={tip}>
		<Button
			{disabled}
			onclick={() => onclick(variantIdx)}
			variant={action === 'delete' ? 'light' : 'outline'}
			color={action === 'delete' ? 'red' : 'blue'}
			fullWidth
			size="sm"
		>
			{#if action === 'add'}
				{variants[variantIdx].values.length} / {MAX_VALUES_PER_VARIANT}
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
		<div class="p-3 w-1/2 mobile-l:w-full border rounded-lg">
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
					/>
				</label>
				{@render variantError(variant.name.error)}
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
					{@render variantError(value.error)}
				</div>
			{/each}
			<div class="flex justify-center items-center gap-1.5 mt-4">
				{@render variantActionButton(
					tClient('product.delVariant'),
					'delete',
					variantIdx,
					handleDeleteVariant
				)}
				{@render variantActionButton(
					tClient('product.addValue'),
					'add',
					variantIdx,
					handleAddVariantValue,
					variant.values.length >= MAX_VALUES_PER_VARIANT
				)}
			</div>
		</div>
	{/each}
	{#if variants.length < MAX_VARIANT_TYPES}
		<div class="w-1/2 mobile-l:w-full">
			<div class="tooltip w-full h-full flex items-center justify-center" data-tip={tClient('product.addVariant')}>
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
	<tr class="">
		{#if indices.length === 1}
			{#if !indices[0]}
				<td rowspan={variants[0].values.length} class="bg-green-100 text-green-700 font-medium text-center border-b border-green-200">{values[0]}</td>
			{/if}
		{:else}
			{#if !indices[1]}
				<td rowspan={variants[1].values.length} class="bg-green-100 text-green-700 font-medium text-center border-b border-green-200">{values[0]}</td>
			{/if}
			<td class="bg-blue-100 text-blue-700 font-medium text-center border-b border-blue-200">{values[1]}</td>
		{/if}
		<td>
			<Input type="text" size="sm" placeholder="Enter value" />
		</td>
		<td>
			<Input type="text" size="sm" placeholder="Enter value" />
		</td>
		<td>
			<Input type="text" size="sm" placeholder="Enter value" />
		</td>
		<td>
			<Input
				type="text"
				size="sm"
				placeholder="Enter value"
				value={values.join('-')}
			/>
		</td>
	</tr>
{/snippet}

<!-- detail -->
{#if variants.length && !generalError}
	<div transition:slide class="mt-10">
		<!-- shortcut -->
		<div class="mb-4">
			<div class="text-xs mb-1">Quick filling</div>
			<div class="flex gap-x-2 items-center flex-row w-full">
				<Input type="text" placeholder="General price" size="sm" />
				<Input type="text" placeholder="Sell channels" size="sm" />
				<Input type="text" placeholder="Stocks" size="sm" />
				<Input type="text" placeholder="Pricing" size="sm" />
				<Button class="btn btn-sm grow shrink" size="sm">Apply</Button>
			</div>
		</div>

		<!-- details -->
		<div class="relative overflow-x-auto rounded-lg p-3 border border-gray-200 bg-gray-50">
			<table class="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-500">
				<thead class="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-500">
					<tr>
						<th>{variants[0].name.value}</th>
						{#if variants.length === MAX_VARIANT_TYPES}
							<th>{variants[1].name.value}</th>
						{/if}
						<th>price</th>
						<th>channel</th>
						<th>stock</th>
						<th>classify sku</th>
					</tr>
				</thead>
				<tbody>
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
