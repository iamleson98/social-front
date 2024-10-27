<script lang="ts">
	import { Icon, type IconType } from '$lib/components/icons';
	import { ICON_BTN_SIZE_MAP } from '$lib/utils/consts';
	import Button, { type Props as ButtonProps } from './Button.svelte';

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
	class={`${className} ${ICON_BTN_SIZE_MAP[size]} ${rounded ? '!rounded-full' : ''}`}
	style="padding: unset !important;"
	>
	<Icon {icon} />
	{#if children}
		{@render children()}
	{/if}
</Button>
