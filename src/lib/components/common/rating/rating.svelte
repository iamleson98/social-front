<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import Star from './star.svelte';
	import { randomID } from '$lib/utils/utils';

	type Props = {
		class?: string;
		size?: number;
		/** default `5` */
		total?: number;
		rating?: number;
		partialId?: string;
		icon?: Component;
		count?: boolean;
		children?: Snippet;
		slotText?: Snippet;
	};

	let {
		class: className = '',
		count,
		size = 24,
		total = 5,
		rating = 0,
		partialId = 'partialStar' + randomID(),
		icon = Star,
		children,
		slotText
	}: Props = $props();

	const fullStarID = randomID();
	const grayStarID = randomID();

	const { fullStars, percentRating, grayStars } = $derived.by(() => {
		const fullStars = Math.floor(rating);
		const rateDifference = rating - fullStars;
		return {
			fullStars,
			percentRating: Math.round(rateDifference * 100),
			grayStars: total - (fullStars + Math.ceil(rateDifference))
		};
	});
</script>

<div class={`flex items-center ${className}`}>
	{#if count}
		<svelte:component this={icon} fillPercent={100} {size} />
		<p class="ms-2 text-sm font-bold text-gray-800 dark:text-white">{rating}</p>
		{#if children}
			{@render children()}
		{/if}
	{:else}
		{#each Array(fullStars) as _}
			<svelte:component this={icon} {size} fillPercent={100} id={fullStarID} />
		{/each}
		{#if percentRating}
			<svelte:component this={icon} {size} fillPercent={percentRating} id={partialId} />
		{/if}
		{#each Array(grayStars) as _}
			<svelte:component this={icon} {size} fillPercent={0} id={grayStarID} />
		{/each}
		{#if slotText}
			{@render slotText()}
		{/if}
	{/if}
</div>

<!--
@component
## Props
@prop export let class: string = 'flex items-center';
@prop export let size: number = 24;
@prop export let total: number = 5;
@prop export let rating: number = 4;
@prop export let partialId: string = 'partialStar' + randomID();
@prop export let children: Snippet = Star;
@prop export let slotText?: Snippet;
@prop export let count: boolean = false;
-->
