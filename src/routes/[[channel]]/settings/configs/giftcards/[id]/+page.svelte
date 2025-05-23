<script lang="ts">
	import { page } from '$app/state';
	import { GIFT_CARD_DETAIL_QUERY, GIFTCARD_LIST_QUERY } from '$lib/api/admin/giftcards';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { SelectSkeleton } from '$lib/components/ui/select';
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
	<SelectSkeleton />
{:else if $giftcardQuery.error}
	<Alert variant="error" bordered size="sm">{$giftcardQuery.error.message}</Alert>
{:else if $giftcardQuery.data}
	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
		{onUpdateClick}
		disabled={loading}
	/>
{/if}
