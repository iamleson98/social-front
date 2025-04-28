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

	const newChannelLink = AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW();
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center justify-between mb-3"
>
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.SETTINGS_CONFIGS_CHANNELS()}>Channels</a></li>
			{#if page.url.pathname === newChannelLink}
				<li>New Channel</li>
			{:else if page.route.id === '/[[channel]]/settings/configs/channels/[id]'}
				<li>{page.params.id}</li>
			{/if}
		</ul>
	</div>
	<div>
		<Button size="xs" endIcon={Plus} href={newChannelLink}>Create Channel</Button>
	</div>
</div>

{@render children()}
