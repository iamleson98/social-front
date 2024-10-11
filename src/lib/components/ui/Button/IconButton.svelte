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
		xs: 'w-6',
		sm: 'w-8',
		md: 'w-12',
		lg: 'w-14',
		xl: 'w-16'
	}[size];
</script>

<Button
	{...rest}
	{size}
	class={`${sizeClass} ${className} ${rounded ? '!rounded-full' : ''}`}
	style="padding-left: unset !important; padding-right: unset !important;"
>
	<Icon {icon} />
	{#if children}
		{@render children()}
	{/if}
</Button>
