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

	const newContractPath = AppRoute.SETTINGS_CONTRACTS_NEW();
</script>

<div class="flex items-center justify-between mb-3">
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.SETTINGS_CONTRACTS()}>Contracts</a></li>
			{#if page.url.pathname === newContractPath}
				<li>Add Contract</li>
			{:else if page.route.id === '/[[channel]]/settings/contracts/[id]'}
				<li>{page.params.id}</li>
			{/if}
		</ul>
	</div>
	<div>
		<Button size="xs" endIcon={Plus} href={newContractPath}>New Contract</Button>
	</div>
</div>

<div>
	{@render children()}
</div>
