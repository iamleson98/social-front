<script lang="ts">
	import { debounceInput } from '$lib/actions/input-debounce';
	import { Icon, Plus } from '$lib/components/icons';
	import { fade, fly } from 'svelte/transition';

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

	let variants = $state.frozen<Variant[]>([
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

	const handleFieldChange = (variantIdx: number, valueIdx: number) => (evt: Event) => {
		if (evt.target) {
			const newValue = (evt.target as HTMLInputElement).value.trim().toLowerCase();

			const valueDuplicate = variants[variantIdx].values.some(
				(value, idx) => idx !== valueIdx && newValue === value.value
			);

			const valueEmpty = !newValue;

			variants = variants.map((variant, idx) => {
				if (idx === variantIdx) {
					return {
						name: variant.name,
						values: variant.values.map((value, idx) => {
							if (idx === valueIdx) {
								return {
									value: newValue,
									error: valueDuplicate
										? 'Value already exists'
										: valueEmpty
											? 'Value cannot be empty'
											: ''
								};
							}

							return value;
						})
					};
				}

				return variant;
			});
		}
	};

	const handleVariantNameChange = (variantIdx: number) => (evt: Event) => {
		if (evt.target) {
			const name = (evt.target as HTMLInputElement).value.trim().toLowerCase();

			const nameDuplicate = variants.some(
				(variant, idx) => idx !== variantIdx && name === variant.name.value
			);
			const nameEmty = !name;

			variants = variants.map((variant, idx) => {
				if (idx === variantIdx) {
					return {
						name: {
							value: name,
							error: nameDuplicate ? 'Name already exists' : nameEmty ? 'Name cannot be empty' : ''
						},
						values: variant.values
					};
				}
				return variant;
			});
		}
	};

	const handleAddVariant = () => {
		if (variants.length < MAX_VARIANT_TYPES) {
			variants = variants.concat({
				name: {
					value: 'Size'
				},
				values: [
					{
						value: 'M'
					}
				]
			});
		}
	};
</script>

{#snippet evalError(message?: string)}
	{#if message}
		<span class="text-red-500 text-xs" transition:fly>{message}</span>
	{/if}
{/snippet}

<!-- composer -->
<div
	class="flex gap-1 mb-3 mobile-l:flex-wrap flex-nowrap"
	class:items-center={variants.length < MAX_VARIANT_TYPES}
>
	{#each variants as variant, variantIdx (variantIdx)}
		<div class="p-3 w-1/2 mobile-l:w-full border rounded">
			<div class="mb-1 text-sm">
				Variant {variantIdx + 1}
			</div>
			<div class="mb-4">
				<label
					class="input input-sm flex items-center gap-2"
					class:input-error={!!variant.name.error}
				>
					<span>name</span>
					<input
						type="text"
						class="w-full"
						placeholder="Enter name"
						use:debounceInput={{ onInput: handleVariantNameChange(variantIdx) }}
						value={variant.name.value}
					/>
				</label>
				{@render evalError(variant.name.error)}
			</div>

			{#each variant.values as value, valueIdx (valueIdx)}
				<div class="mb-2">
					<div class="flex items-center justify-between">
						<input
							class="input input-sm w-4/5"
							class:input-error={!!value.error}
							type="text"
							placeholder="Enter value"
							use:debounceInput={{ onInput: handleFieldChange(variantIdx, valueIdx) }}
							value={value.value}
						/>
						{#if value.value.trim()}
							<button class="btn btn-circle btn-xs" transition:fade title="Add item">
								<Icon icon={Plus} />
							</button>
						{/if}
					</div>
					{@render evalError(value.error)}
				</div>
			{/each}
		</div>
	{/each}
	{#if variants.length < MAX_VARIANT_TYPES}
		<div class="flex items-center justify-center w-1/2 mobile-l:w-full">
			<button class="btn btn-square btn-lg" onclick={handleAddVariant}>
				<Icon icon={Plus} />
			</button>
		</div>
	{/if}
</div>

<!-- details -->
<!-- <div>{variants[0].name}</div> -->
