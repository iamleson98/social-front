<script lang="ts">
	import { ChevronRight, Icon, type IconType } from '$lib/components/icons';

	type ItemProps = {
		value: string;
		icon?: IconType;
		url?: string;
	};

	type Props = {
		items: ItemProps[];
    class?: string;
	};

	let { items, class: className = '' }: Props = $props();
</script>

<ol class={`flex items-center flex-row gap-2 ${className}`}>
	{#each items as item, idx (idx)}
		{@const attrs = item.url ? { href: item.url } : {}}

		<li class="flex items-center gap-2">
			<svelte:element this={item.url ? 'a' : 'span'} {...attrs} class="flex items-center gap-1">
				{#if item.icon}
					<Icon icon={item.icon} />
				{/if}
				<span>{item.value}</span>
			</svelte:element>

			{#if idx !== items.length - 1}
				<Icon icon={ChevronRight} />
			{/if}
		</li>
	{/each}
</ol>
