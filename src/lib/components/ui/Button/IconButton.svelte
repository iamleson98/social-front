<script lang="ts">
	import { Icon, type IconContent } from '$lib/components/icons';
	import Button from './Button.svelte';
	import { ICON_BTN_SIZE_MAP, ICON_ONLY_BUTTON_ICON_SIZE_MAP } from './button.types';
	import type { ButtonProps } from './button.types';

	type Props = { icon?: IconContent; rounded?: boolean } & Omit<
		ButtonProps,
		'startIcon' | 'endIcon' | 'upper' | 'fullWidth' | 'radius'
	>;

	let {
		icon,
		rounded = false,
		children,
		class: className = '',
		size = 'md',
		...rest
	}: Props = $props();
</script>

<Button
	{...rest}
	{size}
	class={`icon-button ${className} ${ICON_BTN_SIZE_MAP[size]} ${rounded ? 'rounded-full!' : ''}`}
>
	{#if icon}
		<!-- explicit size class: Icon skips its auto-scale and this wins deterministically -->
		<Icon {icon} class={ICON_ONLY_BUTTON_ICON_SIZE_MAP[size]} />
	{/if}
	{@render children?.()}
</Button>
