<script lang="ts">
	import { Icon, type IconType } from '$lib/components/icons';
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

	const sizeClass = {
		xs: '!p-1.5',
		sm: '!p-2',
		md: 'p-2.5',
		lg: '!p-3',
		xl: '!p-3.5',
	}[size];
</script>

<Button
	{...rest}
	{size}
	class={`${sizeClass} ${className} ${rounded ? '!rounded-full' : ''}`}
>
	<Icon {icon} />
	{#if children}
		{@render children()}
	{/if}
</Button>
