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

	const newProductLink = AppRoute.SETTINGS_PRODUCTS_NEW();
</script>

<div class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center justify-between mb-3">
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.SETTINGS_PRODUCTS()}>{$tranFunc('product.products')}</a></li>
			{#if page.url.pathname === newProductLink}
				<li>{$tranFunc('settings.newPrd')}</li>
			{:else if page.route.id === '/[[channel]]/settings/products/[slug]'}
				<li>{page.params.slug}</li>
			{/if}
		</ul>
	</div>
	<div>
		<Button size="xs" endIcon={Plus} href={AppRoute.SETTINGS_PRODUCTS_NEW()}
			>{$tranFunc('settings.newPrd')}</Button
		>
	</div>
</div>

<div>
	{@render children()}
</div>
