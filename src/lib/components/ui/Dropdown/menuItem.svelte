<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import type { MenuItemProps } from './types';

	let { children, startIcon, disabled, onclick }: MenuItemProps = $props();
</script>

<div
	class="flex items-center gap-2 py-1 px-2 text-sm {disabled
		? 'cursor-not-allowed'
		: 'cursor-pointer hover:bg-gray-100'}"
	{onclick}
	tabindex="0"
	role="button"
	onkeyup={(e) => e.key === 'Enter' && onclick?.()}
>
	{#if startIcon}
		<Icon icon={startIcon} />
	{/if}
	<span class="text-nowrap">
		{#if children}
			{#if typeof children === 'string'}
				{children}
			{:else}
				{@render children()}
			{/if}
		{/if}
	</span>
</div>
