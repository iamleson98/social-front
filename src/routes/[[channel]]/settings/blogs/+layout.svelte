<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils/routes';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_BLOGS()}
	listingPageLabel="Content Blogs"
	newPageHref={AppRoute.SETTINGS_BLOG_NEW()}
	newPageLabel="New Blog Page"
	detailRouteID="/[[channel]]/settings/blogs/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
