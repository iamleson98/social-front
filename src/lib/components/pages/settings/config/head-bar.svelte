<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui';
	import type { Page } from '@sveltejs/kit';
	import { Plus } from '$lib/components/icons';

	type Props = {
		listingPageHref: string;
		listingPageLabel: string;
		/** If you leave it empty, the new button will not be displayed */
		newPageHref?: string;
		/** If you leave it empty, the new button will not be displayed */
		newPageLabel?: string;
		detailRouteID: string;
		detailPageLabelGetter: (page: Page<Record<string, string>, string | null>) => string;
		/** Optional url, for the convenient `back` link */
		backLinkUrl?: string;
	};

	let {
		listingPageHref,
		listingPageLabel,
		newPageHref,
		newPageLabel,
		detailRouteID,
		detailPageLabelGetter,
		backLinkUrl
	}: Props = $props();

	if ((newPageHref && !newPageLabel) || (!newPageHref && newPageLabel))
		throw new Error('newPageHref and newPageLabel must be provided together');
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center justify-between mb-3"
>
	<div class="breadcrumbs text-sm">
		<ul>
			{#if backLinkUrl}
				<li>
					<a href={backLinkUrl}>Back</a>
				</li>
			{/if}
			<li><a href={listingPageHref}>{listingPageLabel}</a></li>
			{#if page.url.pathname === newPageHref}
				<li>{newPageLabel}</li>
			{:else if page.route.id === detailRouteID}
				<li>{detailPageLabelGetter(page)}</li>
			{/if}
		</ul>
	</div>
	{#if newPageHref}
		<Button size="xs" endIcon={Plus} href={newPageHref}>{newPageLabel}</Button>
	{/if}
</div>
