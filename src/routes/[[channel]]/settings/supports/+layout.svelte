<script lang="ts">
	import { page } from '$app/state';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const meSupportPath = AppRoute.ME_SUPPORT();
	const meSupportNewPath = AppRoute.ME_SUPPORT_NEW();
</script>

<div role="tablist" class="tabs tabs-border">
	<a role="tab" class="tab {page.url.pathname === meSupportPath ? 'tab-active' : ''}"  href={meSupportPath}>My Tickets</a>
	<a role="tab" class="tab {page.url.pathname === meSupportNewPath ? 'tab-active' : ''}" href={meSupportNewPath}>New ticket</a>
</div>

<div>
	{@render children()}
</div>
