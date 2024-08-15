<script context="module" lang="ts">
	export type Props = {
		/** default `24` */
		size?: number;
		/** default `100` */
		fillPercent?: number;
		/** default `currentColor` */
		fillColor?: string;
		/** default currentColor */
		strokeColor?: string;
		/** default `star` */
		ariaLabel?: string;
		id?: string;
		class?: string;
		onclick?: MouseEventHandler<SVGSVGElement>;
	} & Partial<SVGAttributes<SVGElement>>;
</script>

<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { MouseEventHandler, SVGAttributes } from 'svelte/elements';

	let {
		size,
		fillColor = 'currentColor',
		fillPercent = 100,
		strokeColor = 'currentColor',
		ariaLabel = 'star',
		id = randomID(),
		class: className = '',
		role,
		onclick,
		...rest
	}: Props = $props();
</script>

<svg
	width={size}
	height={size}
	class={className}
	aria-label={ariaLabel}
	viewBox="100 100 120 120"
	{role}
	{onclick}
	{...rest}
>
	<defs>
		<linearGradient {id}>
			{#if fillPercent !== 100}
				<stop offset="0%" stop-color={fillColor} />
				<stop offset="{fillPercent}%" stop-color={fillColor} />
				<stop offset="{fillPercent}%" stop-color="transparent" />
				<stop offset="100%" stop-color="transparent" />
			{:else}
				<stop offset="0%" stop-color={fillColor} />
				<stop offset="100%" stop-color={fillColor} />
			{/if}
		</linearGradient>
	</defs>
	<g fill="url(#{id})" stroke={strokeColor} stroke-width="2">
		<polygon
			points="165.000, 185.000, 188.511, 197.361, 184.021, 171.180, 
    203.042, 152.639, 176.756, 148.820, 165.000, 125.000, 
    153.244, 148.820, 126.958, 152.639, 145.979, 171.180,
    141.489, 197.361, 165.000, 185.000"
		/>
	</g>
</svg>
