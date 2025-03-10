<script lang="ts">
	import { Icon, type IconType } from '$lib/components/icons';
	import { ICON_BTN_SIZE_MAP, ICON_OF_BUTTON_SIZE_MAP } from './button.types';
	import Button from './Button.svelte';
	import type { ButtonProps } from './button.types';

	type Props = { icon: IconType; rounded?: boolean } & Omit<
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
	class={`${className} ${ICON_BTN_SIZE_MAP[size]} ${rounded ? 'rounded-full!' : ''}`}
	style="padding: unset !important;"
	>
	<Icon {icon} class={ICON_OF_BUTTON_SIZE_MAP[size]} />
	{#if children}
		{@render children()}
	{/if}
</Button>
