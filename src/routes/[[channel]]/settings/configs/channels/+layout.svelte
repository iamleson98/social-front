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

	const newChannel = AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW();
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center justify-between mb-3"
>
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.SETTINGS_CONFIGS_CHANNELS()}>Channels</a></li>
			{#if page.url.pathname === newChannel}
				<li>New Channel</li>
			{:else if page.route.id === '/[[channel]]/settings/configs/channels'}
				<li>All Channel</li>
			{:else}
				<li>Detail Channel</li>
			{/if}
		</ul>
	</div>
	<div>
		{#if page.url.pathname != newChannel}
			<Button size="xs" endIcon={Plus} href={AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW()}
				>Create Channel</Button
			>
		{/if}
	</div>
</div>

<div>
	{@render children()}
</div>
