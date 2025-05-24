<script lang="ts">
	import { page } from '$app/state';
	import { GIFT_CARD_DETAIL_QUERY } from '$lib/api/admin/giftcards';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import DetailGiftcardSkeleton from '$lib/components/pages/settings/config/giftcards/detail-giftcard-skeleton.svelte';
	import GiftcardDetail from '$lib/components/pages/settings/config/giftcards/giftcard-detail.svelte';
	import GiftcardExtraInformation from '$lib/components/pages/settings/config/giftcards/giftcard-extra-information.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Query, QueryGiftCardArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let loading = $state(false);

	const giftcardQuery = operationStore<Pick<Query, 'giftCard'>, QueryGiftCardArgs>({
		kind: 'query',
		query: GIFT_CARD_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id,
		},
	});

	const onUpdateClick = () => {};
</script>

{#if $giftcardQuery.fetching}
	<DetailGiftcardSkeleton />
{:else if $giftcardQuery.error}
	<Alert variant="error" bordered size="sm">{$giftcardQuery.error.message}</Alert>
{:else if $giftcardQuery.data}
	<div class="flex flex-row gap-2">
		<GiftcardDetail giftcard={$giftcardQuery.data.giftCard!} />
		<GiftcardExtraInformation giftcard={$giftcardQuery.data.giftCard!} />
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
		{onUpdateClick}
		disabled={loading}
	/>
{/if}
