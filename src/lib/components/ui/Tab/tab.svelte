<script lang="ts" module>
	export type TabItem = {
		title: string;
		icon?: IconType;
		/** if provided, each tab will be a link */
		href?: string;
		active?: boolean;
	};
</script>

<script lang="ts">
	import type { IconType } from '$lib/components/icons';
	import { Icon } from '$lib/components/icons';

	type Props = {
		items: readonly TabItem[];
	};

	let { items }: Props = $props();
</script>

<div class="tab-container">
	<ul class="tab-list">
		{#each items as item, index (index)}
			{@const elem = item.href ? 'a' : 'div'}
			{@const attrs = item.href ? { href: item.href } : {}}
			<li class="me-2">
				<svelte:element
					this={elem}
					class="tab-item group"
					class:tab-item-active={item.active}
					{...attrs}
				>
					{#if item.icon}
						<Icon icon={item.icon} class="mr-1.5" />
					{/if}
					<span>{item.title}</span>
				</svelte:element>
			</li>
		{/each}
	</ul>
</div>

<style>
	@import "tailwindcss/theme";

	.tab-container {
		@apply border-b border-gray-200 dark:border-gray-700;
	}

	.tab-list {
		@apply flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400;
	}

	.tab-item {
		@apply inline-flex cursor-pointer items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300;
	}

	.tab-item-active {
		@apply !text-blue-600 !border-blue-600 dark:!text-blue-500 dark:!border-blue-500;
	}
</style>
