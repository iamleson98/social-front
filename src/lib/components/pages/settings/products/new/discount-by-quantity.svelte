<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Plus, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
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
		if (discountRanges.length === MAX_DISCOUNT_RANGES) return;
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
	};

	const removeDiscountRange = (rangeIdx: number) => {
		discountRanges = discountRanges.filter((_, idx) => idx !== rangeIdx);
	};
</script>

<div class="mb-3">
	<span class="text-sm">{$tranFunc('common.discountRange')}</span>
	<div class="border rounded-lg bg-gray-50 border-gray-200 p-3">
		<div class="flex items-center flex-row gap-2 mb-2 text-xs text-gray-700 font-semibold">
			<div class="w-1/12">No.</div>
			<div class="w-10/12 flex items-center gap-1">
				<div class="w-3/12">{$tranFunc('product.channel')}</div>
				<div class="w-3/12">{$tranFunc('product.fromPrd')}</div>
				<div class="w-3/12">{$tranFunc('product.toPrd')}</div>
				<div class="w-3/12">{$tranFunc('product.price')}</div>
			</div>
			<div class="w-1/12">
				<div class="tooltip" data-tip={$tranFunc('product.addDiscountRange')}>
					<IconButton
						icon={Plus}
						size="xs"
						onclick={addDiscountRange}
						variant="light"
						disabled={discountRanges.length >= MAX_DISCOUNT_RANGES}
					/>
				</div>
			</div>
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
	</div>
</div>
