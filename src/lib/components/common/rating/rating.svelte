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
		icon?: Component<{ fillPercent: number; id?: string; size: number }>;
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
		icon: Icon = Star,
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
		<Icon fillPercent={100} {size} />
		<p class="ms-2 text-sm font-bold text-gray-800 dark:text-white">{rating}</p>
		{#if children}
			{@render children()}
		{/if}
	{:else}
		{#each Array(fullStars) as _}
			<Icon fillPercent={100} {size} id={fullStarID} />
		{/each}
		{#if percentRating}
			<Icon fillPercent={percentRating} {size} id={partialId} />
		{/if}
		{#each Array(grayStars) as _}
			<Icon fillPercent={0} {size} id={grayStarID} />
		{/each}
		{#if slotText}
			{@render slotText()}
		{/if}
	{/if}
</div>
