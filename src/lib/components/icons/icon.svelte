<script lang="ts">
	import type { AriaRole } from 'svelte/elements';
	import type { IconType } from '.';

	interface Props {
		class?: string;
		icon: IconType;
		title?: string;
		role?: AriaRole;
		ariaHidden?: boolean;
		ariaLabel?: string;
		ariaLabelledby?: string;
		width?: string | number;
		height?: string | number;
		viewBox?: string;
		fill?: string;
		flipped?: boolean;
	}

	let {
		class: className,
		icon,
		title,
		role = 'img',
		ariaHidden,
		ariaLabel,
		ariaLabelledby,
		width = '1em',
		height = '1em',
		viewBox = '0 0 24 24',
		fill = 'currentColor',
		flipped = false,
		...restProps
	}: Props = $props();
</script>

<svg
	{role}
	aria-label={ariaLabel}
	aria-hidden={ariaHidden}
	aria-labelledby={ariaLabelledby}
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	{viewBox}
	{...restProps}
	{fill}
	class="{className} {flipped ? '-scale-x-100' : ''}"
>
	{#if title}
		<title>{title}</title>
	{/if}
	<svelte:component this={icon} />
</svg>
