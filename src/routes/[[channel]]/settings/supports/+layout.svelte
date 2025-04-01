<script lang="ts">
	import { page } from '$app/state';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const meSupportPath = AppRoute.ME_SUPPORT();
	const meSupportNewPath = AppRoute.ME_SUPPORT_NEW();
</script>

<!-- <div role="tablist" class="tabs tabs-border">
	<a role="tab" class="tab {page.url.pathname === meSupportPath ? 'tab-active' : ''}"  href={meSupportPath}>My Tickets</a>
	<a role="tab" class="tab {page.url.pathname === meSupportNewPath ? 'tab-active' : ''}" href={meSupportNewPath}>New ticket</a>
</div> -->

<div class="flex items-center justify-between mb-3">
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.ME_SUPPORT()}>Support Tickets</a></li>
			{#if page.url.pathname === meSupportNewPath}
				<li>New ticket</li>
			{:else if page.route.id === '/[[channel]]/settings/supports/[id]'}
				<li>{page.params.id}</li>
			{/if}
		</ul>
	</div>
	<div>
		<Button size="xs" endIcon={Plus} href={meSupportNewPath}>New Ticket</Button>
	</div>
</div>

<div>
	{@render children()}
</div>
