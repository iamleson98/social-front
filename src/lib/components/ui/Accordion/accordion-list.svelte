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
	<ul class="list-none text-sm tablet:text-xs">
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
				<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					class="py-1 cursor-pointer flex items-center space-x-2 text-xs"
					role="button"
					tabindex="0"
					onclick={handleShowMore}
				>
					<span>{$tranFunc('common.more')}</span>
					<Icon icon={ChevronDown} />
				</li>
			{/if}
		{/if}
	</ul>
</Accordion>
