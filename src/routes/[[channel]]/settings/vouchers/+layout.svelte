<script lang="ts">
	import { tranFunc } from '$i18n';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_VOUCHERS()}
	listingPageLabel={$tranFunc('voucher.vouchers')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_VOUCHER_NEW()}
	newPageLabel={$tranFunc('voucher.newVoucher')}
	detailRouteID="/[[channel]]/settings/vouchers/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
