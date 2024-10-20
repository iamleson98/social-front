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

	const dirClass: Record<Direction, string> = {
		horizontal: 'flex-row',
		vertical: 'flex-col'
	};
</script>

<div class={`${className} flex ${dirClass[dir]} !select-none`}>
	{#each items as item, idx (idx)}
		<div
			class={`text-sm ${dir === 'horizontal' ? 'flex items-center gap-1.5' : ''} ${item.done ? '!text-green-600' : 'text-gray-400'}`}
		>
			<div class="inline-flex items-center gap-1.5">
				<Icon icon={CircleCheckFilled} />
				<span class="font-semibold">{item.title}</span>
			</div>
			{#if idx !== items.length - 1}
				<div
					class={`rounded-full ${item.done ? '!bg-green-600' : 'bg-gray-400'} ${dir === 'horizontal' ? 'h-0.5 w-10 mx-1.5' : 'w-0.5 h-8 my-1.5 ml-[7px]'}`}
				></div>
			{/if}
		</div>
	{/each}
</div>
