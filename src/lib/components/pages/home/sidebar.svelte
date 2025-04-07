<script lang="ts">
	import { page } from '$app/state';
	import { CHANNELS, DEFAULT_CHANNEL } from '$lib/utils/channels';
	import CategoriesAccordion from './sidebar-category.svelte';
	import SidebarFilter from './sidebar-filter.svelte';

	const CHANNEL = CHANNELS.find((chan) => chan.slug === page.params.channel) || DEFAULT_CHANNEL;
</script>

<CategoriesAccordion />
<SidebarFilter currency={CHANNEL.currency} />
