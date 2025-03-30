<script lang="ts">
	import { page } from '$app/state';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const meSupportPath = AppRoute.SETTINGS_CONTRACTS();
	const meSupportNewPath = AppRoute.SETTINGS_CONTRACTS_NEW();
</script>

<div role="tablist" class="tabs tabs-border">
	<a role="tab" class="tab {page.url.pathname === meSupportPath ? 'tab-active' : ''}"  href={meSupportPath}>Contracts</a>
	<a role="tab" class="tab {page.url.pathname === meSupportNewPath ? 'tab-active' : ''}" href={meSupportNewPath}>New Contract</a>
</div>

<div>
	{@render children()}
</div>
