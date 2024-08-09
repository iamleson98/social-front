<script lang="ts">
	import { debounceInput } from '$lib/actions/input-debounce';
	import { Icon, Plus, Trash } from '$lib/components/icons';
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
	const MAX_VALUES_PER_VARIANT = 5;

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
	let generalError = $state(false);

	const handleVariantValueChange = (variantIdx: number, valueIdx: number) => (evt: Event) => {
		if (evt.target) {
			const newValue = (evt.target as HTMLInputElement).value.trim().toLowerCase();

			const valueDuplicate = variants[variantIdx].values.some(
				(value, idx) => idx !== valueIdx && newValue === value.value
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
										? 'Value already exists'
										: !newValue
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

			tick();
		}
	};

	const handleVariantNameChange = (variantIdx: number) => (evt: Event) => {
		if (evt.target) {
			const name = (evt.target as HTMLInputElement).value.trim().toLowerCase();

			const nameDuplicate = variants.some(
				(variant, idx) => idx !== variantIdx && name === variant.name.value
			);

			generalError = nameDuplicate || !name;
			variants = variants.map((variant, idx) => {
				if (idx === variantIdx) {
					return {
						name: {
							value: name,
							error: nameDuplicate ? 'Name already exists' : !name ? 'Name cannot be empty' : ''
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

	const handleDeleteVariant = (variantIdx: number) => {
		if (variants.length) {
			variants = variants.filter((_, idx) => idx !== variantIdx);
			tick(); // tick() is important here, it solves the issue of the transition not working
		}
	};

	const handleAddVariantValue = (variantIdx: number) => {
		variants = variants.map((variant, idx) => {
			if (idx === variantIdx) {
				if (variant.values.length >= MAX_VALUES_PER_VARIANT) {
					return variant;
				}
				return {
					name: variant.name,
					values: [...variant.values, { value: '' }]
				};
			}
			return variant;
		});
	};

	type variantAction = (idx: number) => void;

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

{#snippet evalError(message?: string)}
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
		<button
			{disabled}
			class={`btn btn-sm w-full ${action === 'delete' ? '!text-red-600  !border-red-500' : '!text-blue-600  !border-blue-500'}  !bg-white`}
			onclick={() => onclick(variantIdx)}
		>
			{#if action === 'add'}
				{variants[variantIdx].values.length} / {MAX_VALUES_PER_VARIANT}
				<Icon icon={Plus} />
			{:else}
				<Icon icon={Trash} />
			{/if}
		</button>
	</div>
{/snippet}

<!-- composer -->
<div
	class="flex gap-1 mb-3 mobile-l:flex-wrap flex-nowrap"
	class:items-center={variants.length < MAX_VARIANT_TYPES}
>
	{#each variants as variant, variantIdx (variantIdx)}
		<div class="p-3 w-1/2 mobile-l:w-full border rounded">
			<!-- title -->
			<div class="mb-1 text-xs">
				Variant {variantIdx + 1}
			</div>
			<!-- name -->
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

			<!-- values -->
			{#each variant.values as value, valueIdx (valueIdx)}
				<div class="mb-2" transition:slide>
					<div class="flex items-center justify-between">
						<input
							class="input input-sm w-4/5"
							class:input-error={!!value.error}
							type="text"
							placeholder="Enter value"
							use:debounceInput={{ onInput: handleVariantValueChange(variantIdx, valueIdx) }}
							value={value.value}
						/>
						{#if variant.values.length > 1}
							<button
								class="btn btn-circle btn-xs !bg-red-100 text-red-600"
								title="delete item"
								onclick={() => handleDeleteValue(variantIdx, valueIdx)}
							>
								<Icon icon={Trash} />
							</button>
						{/if}
					</div>
					{@render evalError(value.error)}
				</div>
			{/each}
			<div class="flex justify-center items-center gap-1 mt-4">
				{@render variantActionButton(
					'Add value',
					'add',
					variantIdx,
					handleAddVariantValue,
					variant.values.length >= MAX_VALUES_PER_VARIANT
				)}
				{@render variantActionButton('Delete variant', 'delete', variantIdx, handleDeleteVariant)}
			</div>
		</div>
	{/each}
	{#if variants.length < MAX_VARIANT_TYPES}
		<div class="flex items-center justify-center w-1/2 mobile-l:w-full">
			<div class="tooltip" data-tip="Addvariant">
				<button class="btn btn-square btn-lg text-blue-600" onclick={handleAddVariant}>
					<Icon icon={Plus} />
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- details -->
<!-- <div>{variants[0].name}</div> -->
