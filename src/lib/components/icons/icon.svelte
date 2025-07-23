<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { IconContent } from './consts';
	import type { SocialSize } from '$lib/components/ui/common';
	import { ICON_OF_BUTTON_SIZE_MAP } from '$lib/components/ui/Button';

	type Props = {
		/**
		 * in case it is string:
		 * - it must have format like <path /> or <g />.
		 * - you must define your svg body within ./consts.ts file with a meaningful name.
		 */
		icon: IconContent;
		title?: string;
		flipped?: boolean;
		class?: string;
		size?: SocialSize | 'xxs';
	};

	let {
		class: className,
		icon: Icon,
		title,
		size = 'md',
		viewBox = '0 0 24 24',
		fill = 'currentColor',
		flipped = false,
		...restProps
	}: Props & Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height'> = $props();
</script>

<svg
	{viewBox}
	{fill}
	class="{className} {flipped ? '-scale-x-100' : ''} {ICON_OF_BUTTON_SIZE_MAP[size]}"
	{...restProps}
>
	{#if title}
		<title>{title}</title>
	{/if}
	{@html Icon}
</svg>
