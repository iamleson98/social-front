<script lang="ts">
	import { T } from '$i18n';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
	listingPageLabel={$T('common.categories')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_CATEGORY_NEW()}
	newPageLabel={$T('category.new')}
	detailRouteID="/[[channel]]/settings/categories/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
