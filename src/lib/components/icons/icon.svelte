<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { IconContent } from './consts';

	interface Props {
		/**
		 * in case it is string:
		 * - it must have format like <path /> or <g />.
		 * - you must define your svg body within ./consts.ts file with a meaningful name.
		 */
		icon: IconContent;
		title?: string;
		flipped?: boolean;
		class?: string;
	}

	let {
		class: className,
		icon: Icon,
		title,
		width = '1rem',
		height = '1rem',
		viewBox = '0 0 24 24',
		fill = 'currentColor',
		flipped = false,
		...restProps
	}: Props & SVGAttributes<SVGSVGElement> = $props();
</script>

<svg
	{width}
	{height}
	{viewBox}
	{fill}
	class="{className} {flipped ? '-scale-x-100' : ''}"
	{...restProps}
>
	{#if title}
		<title>{title}</title>
	{/if}
	{@html Icon}
</svg>
