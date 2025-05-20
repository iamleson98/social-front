<script lang="ts" generics="T">
	import Accordion from './accordion.svelte';
	import { tranFunc } from '$i18n';
	import { ChevronDown, Icon } from '$lib/components/icons';
	import type { AccordionListProps } from './types';

	const {
		items,
		partialDisplay = 'all',
		child,
		loadingMoreTimeout = 1000,
		...rest
	}: AccordionListProps<T> = $props();

	let numOfItemsToShow = $state(partialDisplay === 'all' ? items.length : partialDisplay);
	let showingMore = $state(false);

	const handleShowMore = () => {
		if (partialDisplay === 'all') return;

		showingMore = true;
		const timeout = setTimeout(() => {
			clearTimeout(timeout);

			numOfItemsToShow += partialDisplay;
			showingMore = false;
		}, loadingMoreTimeout);
	};
</script>

<Accordion {...rest}>
	<ul class="list-none text-sm tablet:text-xs" role="menu">
		{#each items.slice(0, numOfItemsToShow) as item, idx (idx)}
			<li class="py-1 break-all">
				{@render child(item)}
			</li>
		{/each}
		{#if numOfItemsToShow < items.length}
			{#if showingMore}
				<li class="py-1 text-xs">
					<span class="loading loading-spinner loading-xs"></span>
				</li>
			{:else}
				<li
					class="py-1 cursor-pointer flex items-center space-x-2 text-xs"
					role="menuitem"
					tabindex="0"
					onclick={handleShowMore}
					onkeyup={(evt) => evt.key === 'Enter' && handleShowMore()}
				>
					<span>{$tranFunc('common.more')}</span>
					<Icon icon={ChevronDown} />
				</li>
			{/if}
		{/if}
	</ul>
</Accordion>
