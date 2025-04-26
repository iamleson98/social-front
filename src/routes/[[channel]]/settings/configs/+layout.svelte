<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const CHANNELS_PATH = AppRoute.SETTINGS_CONFIGS_CHANNELS();
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center justify-between mb-3"
>
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.SETTINGS_CONFIGS()}>{$tranFunc('settings.configs')}</a></li>
			{#if page.url.pathname === CHANNELS_PATH}
				<li>
					<a href={CHANNELS_PATH}>{$tranFunc('product.channel')}</a>
				</li>
			{:else if page.url.pathname === AppRoute.SETTINGS_CONFIGS_STAFFS()}
				<li>{$tranFunc('settings.staffs')}</li>
			{/if}

			{#if page.route.id === '/[[channel]]/settings/configs/channels/[id]'}
				<li>
					<a href={CHANNELS_PATH}>{$tranFunc('product.channel')}</a>
				</li>
				<li>{page.params.id}</li>
			{/if}
		</ul>
	</div>
</div>

<div>
	{@render children()}
</div>
