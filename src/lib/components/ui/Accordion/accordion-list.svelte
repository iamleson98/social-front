<script lang="ts" generics="T">
	import { tick, type Snippet } from 'svelte';
	import type { Props } from './accordion.svelte';
	import Accordion from './accordion.svelte';
	import { tClient } from '$i18n';
	import { ChevronDown, Icon } from '$lib/components/icons';
	import { slide } from 'svelte/transition';

	type AccordionListProps = Omit<Props, 'children'> & {
		child: Snippet<[T]>;
		items: T[];
		/** default `all` */
		partialDisplay?: number | 'all';
		/** default `1000` */
		loadingMoreTimeout?: number;
	};

	const {
		items,
		partialDisplay = 'all',
		child,
		loadingMoreTimeout = 1000,
		...rest
	}: AccordionListProps = $props();

	if (typeof partialDisplay === 'number' && partialDisplay < 0) {
		throw new Error('partialDisplay must be a positive number');
	}

	let numOfItemsToShow = $state(partialDisplay === 'all' ? items.length : partialDisplay);
	let showingMore = $state(false);

	const handleShowMore = () => {
		if (partialDisplay === 'all') return;

		showingMore = true;
		const timeout = setTimeout(() => {
			clearTimeout(timeout);

			numOfItemsToShow += partialDisplay;
			tick();
			showingMore = false;
		}, loadingMoreTimeout);
	};
</script>

<Accordion {...rest}>
	<ul class="list-none text-sm">
		{#each items.slice(0, numOfItemsToShow) as item, idx (idx)}
			<li class="py-1" transition:slide>
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
					<span>{tClient('common.more')}</span>
					<Icon icon={ChevronDown} />
				</li>
			{/if}
		{/if}
	</ul>
</Accordion>
