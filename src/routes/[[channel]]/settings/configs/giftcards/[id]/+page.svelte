<script lang="ts">
	import { page } from '$app/state';
	import { GIFT_CARD_DETAIL_QUERY } from '$lib/api/admin/giftcards';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import DetailGiftcardSkeleton from '$lib/components/pages/settings/config/giftcards/detail-giftcard-skeleton.svelte';
	import GiftcardDetail from '$lib/components/pages/settings/config/giftcards/giftcard-detail.svelte';
	import GiftcardExtraInformation from '$lib/components/pages/settings/config/giftcards/giftcard-extra-information.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/config/giftcards/utils.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { type GiftCardUpdateInput, type Query, type QueryGiftCardArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { onMount } from 'svelte';

	const giftcardUtils = new GiftcardUtil();

	let internalLoading = $state(false);
	let loading = $derived(internalLoading || giftcardUtils.loading);

	const giftcardQuery = operationStore<Pick<Query, 'giftCard'>, QueryGiftCardArgs>({
		kind: 'query',
		query: GIFT_CARD_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

	let giftcardUpdateInput = $state<GiftCardUpdateInput>({
		removeTags: [],
		addTags: [],
	});

	onMount(() =>
		giftcardQuery.subscribe((result) => {
			if (!result.data?.giftCard) return;

			const { tags, currentBalance, expiryDate, isActive: active } = result.data.giftCard;

			giftcardUpdateInput = {
				addTags: tags.map((tag) => tag.id),
				balanceAmount: currentBalance.amount,
				expiryDate: expiryDate,
			};
		}),
	);

	const onUpdateClick = () => {};

	const onActiveChange = async (active: boolean) => {
		const hasError = await giftcardUtils.handleToggleGiftcardStatus(page.params.id, active);

		if (!hasError)
			giftcardQuery.reexecute({
				variables: { id: page.params.id },
				context: { requestPolicy: 'network-only' },
			});
	};
</script>

{#if $giftcardQuery.fetching}
	<DetailGiftcardSkeleton />
{:else if $giftcardQuery.error}
	<Alert variant="error" bordered size="sm">{$giftcardQuery.error.message}</Alert>
{:else if $giftcardQuery.data?.giftCard}
	{@const { giftCard } = $giftcardQuery.data}
	<div class="flex flex-row gap-2">
		<GiftcardDetail
			bind:balanceAmount={giftcardUpdateInput.balanceAmount}
			balanceCurrency={giftCard.currentBalance.currency || giftCard.initialBalance.currency}
			bind:expiryDate={giftcardUpdateInput.expiryDate}
			isActive={giftCard.isActive}
			bind:addTags={giftcardUpdateInput.addTags!}
			bind:removeTags={giftcardUpdateInput.removeTags!}
			bind:metadata={giftCard.metadata}
			bind:privateMetadata={giftCard.privateMetadata}
			id={giftCard.id}
			{onActiveChange}
			disabled={loading}
		/>
		<GiftcardExtraInformation giftcard={$giftcardQuery.data.giftCard!} />
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
		{onUpdateClick}
		disabled={loading}
	/>
{/if}
