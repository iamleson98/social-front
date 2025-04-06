<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	// const meSupportPath = AppRoute.ME_SUPPORT();
	const meSupportNewPath = AppRoute.ME_SUPPORT_NEW();
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between">
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.ME_SUPPORT()}>{$tranFunc('settings.requests')}</a></li>
			{#if page.url.pathname === meSupportNewPath}
				<li>{$tranFunc('settings.newRequest')}</li>
			{:else if page.route.id === '/[[channel]]/settings/supports/[id]'}
				<li>{page.params.id}</li>
			{/if}
		</ul>
	</div>
	<div>
		<Button size="xs" endIcon={Plus} href={meSupportNewPath}>{$tranFunc('settings.newRequest')}</Button>
	</div>
</div>

<div>
	{@render children()}
</div>
