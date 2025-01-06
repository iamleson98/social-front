<script lang="ts">
	import { CircleCheckFilled, Icon } from '$lib/components/icons';

	type Direction = 'horizontal' | 'vertical';

	type Props = {
		items: ItemProps[];
		/** default `horizontal` */
		dir?: Direction;
		class?: string;
	};

	type ItemProps = {
		done: boolean;
		title: string;
	};

	let { items, dir = 'horizontal', class: className = '' }: Props = $props();
</script>

<div class={`${className} flex tl-${dir} select-none!`}>
	{#each items as item, idx (idx)}
		<div
			class={`text-sm ${item.done ? 'text-green-600!' : 'text-gray-400'}`}
			class:tl-item-horizontal={dir === 'horizontal'}
		>
			<div class="inline-flex items-center gap-1.5">
				<Icon icon={CircleCheckFilled} />
				<span class="font-semibold">{item.title}</span>
			</div>
			{#if idx !== items.length - 1}
				<div class={`rounded-sm ${item.done ? 'bg-green-600!' : 'bg-gray-400'} tl-line-${dir}`}></div>
			{/if}
		</div>
	{/each}
</div>

<style>
	@import "tailwindcss/theme";

	.tl-horizontal {
		@apply flex-row;
	}
	.tl-vertical {
		@apply flex-col;
	}
	.tl-item-horizontal {
		@apply flex items-center gap-1.5;
	}
	.tl-line-horizontal {
		@apply h-0.5 w-10 mx-1.5;
	}
	.tl-line-vertical {
		@apply w-0.5 h-8 my-1.5 ml-[7px];
	}
</style>
