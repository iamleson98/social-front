<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div role="tablist" class="tabs tabs-border">
	<a
		role="tab"
		class="tab"
		class:tab-active={page.url.pathname.startsWith(AppRoute.TAX_SETTINGS_CHANNELS())}
		href={AppRoute.TAX_SETTINGS_CHANNELS()}>Channels</a
	>
	<a
		role="tab"
		class="tab tab-active"
		class:tab-active={page.url.pathname.startsWith(AppRoute.TAX_SETTINGS_COUNTRIES())}
		href={AppRoute.TAX_SETTINGS_COUNTRIES()}>Countries</a
	>
	<a
		role="tab"
		class="tab"
		class:tab-active={page.url.pathname.startsWith(AppRoute.TAX_SETTINGS_TAX_CLASSES())}
		href={AppRoute.TAX_SETTINGS_TAX_CLASSES()}>Tax classes</a
	>
</div>

<div class="mt-4">
	{@render children()}
</div>
