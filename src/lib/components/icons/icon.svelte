<script lang="ts">
	// import type { SvelteComponent } from 'svelte';
	import type { AriaRole } from 'svelte/elements';
	import type { IconType } from '.';

	export let width: string | number = '1em';
	export let height: string | number = '1em';
	export let role: AriaRole = 'img';
	export let ariaHidden: boolean | undefined = undefined;
	export let ariaLabel: string | undefined = undefined;
	export let ariaLabelledby: string | undefined = undefined;
	export let fill = 'currentColor';
	export let title: string | null = null;
	let className = '';
	export { className as class };
	export let flipped = false;
	export let icon: IconType;
</script>

<svg
	{role}
	aria-label={ariaLabel}
	aria-hidden={ariaHidden}
	aria-labelledby={ariaLabelledby}
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	viewBox="0 0 24 24"
	{...$$props}
	{fill}
	class="{className} {flipped ? '-scale-x-100' : ''}"
>
	{#if title}
		<title>{title}</title>
	{/if}
	<svelte:component this={icon} />
</svg>
