<script lang="ts">
	import { Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
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

<div class="border rounded-lg bg-gray-50 border-gray-200 p-3">
	<div class="flex items-center flex-row gap-2 mb-2 text-xs text-gray-700 font-semibold">
		<div class="w-1/12">No.</div>
		<div class="w-10/12 flex items-center gap-1">
			<div class="w-3/12">channel</div>
			<div class="w-3/12">from product</div>
			<div class="w-3/12">to product</div>
			<div class="w-3/12">price</div>
		</div>
		<div class="w-1/12"></div>
	</div>

	{#each discountRanges as range, idx (idx)}
		<div transition:slide class="flex items-center flex-row gap-2 mb-2">
			<div class="w-1/12">{idx + 1}</div>
			<div class="w-10/12 flex items-center gap-1">
				<Input size="sm" type="text" placeholder="channel" value={range.channelSlug} />
				<Input size="sm" type="number" placeholder="from" value={range.fromProduct} />
				<Input size="sm" type="number" placeholder="to" value={range.toProduct} />
				<Input size="sm" type="number" placeholder="price" value={range.discount} />
			</div>
			<div class="w-1/12">
				<IconButton
					icon={Trash}
					onclick={() => removeDiscountRange(idx)}
					size="xs"
					rounded
					variant="light"
					color="red"
				/>
			</div>
		</div>
	{/each}
	<div class="tooltip w-full" data-tip="Add discount range">
		<Button
			disabled={discountRanges.length >= MAX_DISCOUNT_RANGES}
			onclick={addDiscountRange}
			startIcon={Plus}
			fullWidth
			size="sm"
		>
			Add range ({discountRanges.length}/{MAX_DISCOUNT_RANGES})
		</Button>
	</div>
</div>
