<script lang="ts">
	import { Icon, Plus, Trash } from '$lib/components/icons';
	import { slide } from 'svelte/transition';

	type DiscountRange = {
		channelSlug: string;
		fromProduct: number;
		toProduct: number;
		discount: number;
	};

	const MAX_DISCOUNT_RANGES = 4;

	let discountRanges = $state.raw<DiscountRange[]>([]);

	const addDiscountRange = () => {
		if (discountRanges.length < MAX_DISCOUNT_RANGES) {
			const newRange: DiscountRange = {
				channelSlug: '',
				fromProduct: 0,
				toProduct: 0,
				discount: 0
			};
			if (discountRanges.length) {
				newRange.fromProduct = discountRanges[discountRanges.length - 1].toProduct + 1;
        newRange.toProduct = newRange.fromProduct + 1;
			}
			discountRanges = discountRanges.concat(newRange);
		}
	};

	const removeDiscountRange = (rangeIdx: number) => {
		discountRanges = discountRanges.filter((_, idx) => idx !== rangeIdx);
	};
</script>

{#each discountRanges as range, idx (idx)}
	<div transition:slide class="flex items-end gap-1 mb-2">
		<div># {idx + 1}</div>
		<label for="" class="form-control text-xs">
			<div>channel</div>
			<input
				type="text"
				placeholder="channel"
				class="input input-xs w-full"
				value={range.channelSlug}
			/>
		</label>
		<label for="" class="form-control text-xs">
			<div>from product</div>
			<input
				type="number"
				placeholder="from"
				class="input input-xs w-full"
				value={range.fromProduct}
			/>
		</label>
		<label for="" class="form-control text-xs">
			<div>to product</div>
			<input type="number" placeholder="to" class="input input-xs w-full" value={range.toProduct} />
		</label>
		<label for="" class="form-control text-xs">
			<div>price</div>
			<input
				type="number"
				placeholder="price"
				class="input input-xs w-full"
				value={range.discount}
			/>
		</label>
		<button
			class="btn btn-xs !text-red-500 !bg-red-100 btn-circle"
			onclick={() => removeDiscountRange(idx)}
		>
			<Icon icon={Trash} />
		</button>
	</div>
{/each}
<div class="tooltip w-full" data-tip="Add discount range">
	<button
		class="btn w-full btn-sm !text-blue-600 !border-blue-600 !bg-white"
		disabled={discountRanges.length >= MAX_DISCOUNT_RANGES}
		onclick={addDiscountRange}
	>
		Add range
		<Icon icon={Plus} />
		({discountRanges.length} / {MAX_DISCOUNT_RANGES})
	</button>
</div>

<style lang="postcss">
	input.input {
		@apply border-gray-200;
	}
</style>
