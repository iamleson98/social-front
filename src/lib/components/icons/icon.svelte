<script lang="ts">
	import type { SocialSize } from '$lib/components/ui/common';
	import type { IconContent } from './consts';
	import type { SVGAttributes } from 'svelte/elements';

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

	/**
	 * Icon size scale.
	 * The classes are intentionally NOT `!important`: when the caller passes
	 * an explicit sizing utility (`size-*`, `w-*`, `h-*`) via `class`, the
	 * auto-size is skipped entirely — two same-property utilities on one
	 * element would otherwise resolve by stylesheet order (unpredictable),
	 * which is exactly how "icons rendered at the wrong size" crept in before.
	 */
	const ICON_SIZE_CLASS: Record<SocialSize | 'xxs', string> = {
		xxs: 'size-2',
		xs: 'size-4',
		sm: 'size-4.5',
		md: 'size-5',
		lg: 'size-6',
		xl: 'size-7',
	};

	let {
		class: className,
		icon,
		title,
		size = 'md',
		viewBox = '0 0 24 24',
		fill = 'currentColor',
		flipped = false,
		...restProps
	}: Props & Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height'> = $props();

	const hasExplicitSizeClass = className ? /(?:^|\s)(?:size|w|h)-[\d.]/.test(className) : false;
</script>

<svg
	{viewBox}
	{fill}
	class="{className} {flipped ? '-scale-x-100' : ''} {hasExplicitSizeClass
		? ''
		: ICON_SIZE_CLASS[size]}"
	{...restProps}
>
	{#if title}
		<title>{title}</title>
	{/if}
	{@html icon}
</svg>
