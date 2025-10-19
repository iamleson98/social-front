<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { ClipboardCopy, Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { stringSlicer } from '$lib/utils/utils';
	import type { Page } from '@sveltejs/kit';

	type Props = {
		listingPageHref: string;
		listingPageLabel: string;
		/** If you leave it empty, the new button will not be displayed */
		newPageHref?: string;
		/** If you leave it empty, the new button will not be displayed */
		newPageLabel?: string;
		detailRouteID: string;
		detailPageLabelGetter: (page: Page<Record<string, string>, any>) => string;
		onNewPageBtnClick?: (evt: Event) => void;
		disabled?: boolean;
	};

	let {
		listingPageHref,
		listingPageLabel,
		newPageHref,
		newPageLabel,
		detailRouteID,
		detailPageLabelGetter,
		onNewPageBtnClick,
		disabled,
	}: Props = $props();

	let copyTooltip = $state($tranFunc('common.copy'));

	const handleCopy = (content: string) => {
		navigator.clipboard.writeText(content).then(() => {
			copyTooltip = $tranFunc('common.copied');

			setTimeout(() => (copyTooltip = $tranFunc('common.copy')), 3000);
		});
	};
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-1 flex items-center justify-between mb-3"
>
	<div class="breadcrumbs text-sm overflow-x-visible">
		<ul>
			<li>
				<a href={listingPageHref} class="link text-blue-600 font-medium">{listingPageLabel}</a>
			</li>
			{#if page.url.pathname === newPageHref}
				<li>{newPageLabel}</li>
			{:else if page.route.id === detailRouteID}
				{@const id = stringSlicer(detailPageLabelGetter(page), 40)}
				<li class="flex items-center gap-1">
					<span>
						{id}
					</span>
					<IconButton
						onclick={() => handleCopy(id)}
						icon={ClipboardCopy}
						rounded
						class="tooltip tooltip-right"
						data-tip={copyTooltip}
						size="xs"
						color="gray"
						variant="light"
					/>
				</li>
			{/if}
		</ul>
	</div>

	{#if newPageLabel && page.url.pathname !== newPageHref}
		{@const props = newPageHref ? { href: newPageHref } : {}}
		<Button size="xs" endIcon={Plus} {...props} onclick={onNewPageBtnClick} {disabled}>
			{newPageLabel}
		</Button>
	{/if}
</div>
