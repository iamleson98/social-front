<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import type { MenuItemProps } from './types';

	let {
		children,
		startIcon,
		disabled,
		onclick,
		class: className = '',
		isActive,
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
	onclick={handleClick}
	tabindex="0"
	role="button"
	class={[
		'flex items-center gap-2 py-1 px-2 text-sm flex-nowrap select-none!',
		disabled && 'cursor-not-allowed! text-gray-400',
		className,
		!disabled && 'cursor-pointer hover:bg-gray-100 transition-colors duration-100 ease-in-out text-gray-700',
		isActive && 'bg-blue-100! text-blue-600!',
	]}
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
