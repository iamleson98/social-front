<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import type { MenuItemProps } from './types';

	let {
		children,
		startIcon,
		disabled,
		onclick,
		class: className = '',
		...rest
	}: MenuItemProps = $props();

	const handleClick = (evt: MouseEvent) => {
		if (disabled) {
			if (rest.href) evt.preventDefault();
			return;
		}

		onclick?.();
	};
</script>

<svelte:element
	this={rest.href ? 'a' : 'div'}
	{...rest}
	class="flex items-center gap-2 py-1 px-2 text-sm flex-nowrap select-none! {disabled
		? 'cursor-not-allowed! text-gray-400'
		: 'cursor-pointer hover:bg-gray-100 text-gray-700'} {className}"
	onclick={handleClick}
	tabindex="0"
	role="button"
>
	{#if startIcon}
		<Icon icon={startIcon} />
	{/if}
	<div class="text-nowrap">
		{#if children}
			{#if typeof children === 'string'}
				{children}
			{:else}
				{@render children()}
			{/if}
		{/if}
	</div>
</svelte:element>
