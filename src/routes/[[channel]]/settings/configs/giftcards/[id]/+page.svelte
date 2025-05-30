<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { GIFT_CARD_DETAIL_QUERY, GIFT_CARD_UPDATE_MUTATION } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailGiftcardSkeleton from '$lib/components/pages/settings/config/giftcards/detail-giftcard-skeleton.svelte';
	import GiftcardDetail from '$lib/components/pages/settings/config/giftcards/giftcard-detail.svelte';
	import GiftcardEvents from '$lib/components/pages/settings/config/giftcards/giftcard-events.svelte';
	import GiftcardExtraInformation from '$lib/components/pages/settings/config/giftcards/giftcard-extra-information.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/config/giftcards/utils.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type GiftCardUpdateInput,
		type Mutation,
		type MutationGiftCardUpdateArgs,
		type Query,
		type QueryGiftCardArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const giftcardUtils = new GiftcardUtil();

	let loading = $state(false);
	let performUpdateMetadata = $state(false);

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

			const { tags, currentBalance, expiryDate } = result.data.giftCard;

			giftcardUpdateInput = {
				addTags: tags.map((tag) => tag.id),
				balanceAmount: currentBalance.amount,
				expiryDate: expiryDate,
			};
		}),
	);

	const onUpdateClick = async () => {
		loading = true;
		performUpdateMetadata = true; // trigger for metadata update

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardUpdate'>,
			MutationGiftCardUpdateArgs
		>(GIFT_CARD_UPDATE_MUTATION, { id: page.params.id, input: giftcardUpdateInput });

		loading = false;

		if (!checkIfGraphqlResultHasError(result, 'giftCardUpdate', 'Giftcard updated successfully')) {
			giftcardQuery.reexecute({
				variables: { id: page.params.id },
				context: { requestPolicy: 'network-only' },
			});
		}
	};

	const onDeleteClick = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure to delete the gift card ${page.params.id}?`,
			onOk: async () => {
				loading = true;
				const hasError = await giftcardUtils.handleDeleteGiftcard(page.params.id);
				loading = false;
				if (!hasError) await goto(AppRoute.SETTINGS_CONFIGS_GIFTCARDS());
			},
		});
	};

	const onActiveChange = async (active: boolean) => {
		loading = true;
		const hasError = await giftcardUtils.handleToggleGiftcardStatus(page.params.id, active);
		loading = false;

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
		<div class="w-7/10 flex flex-col gap-2">
			<GiftcardDetail
				bind:balanceAmount={giftcardUpdateInput.balanceAmount}
				bind:expiryDate={giftcardUpdateInput.expiryDate}
				bind:addTags={giftcardUpdateInput.addTags!}
				bind:removeTags={giftcardUpdateInput.removeTags!}
				balanceCurrency={giftCard.currentBalance.currency || giftCard.initialBalance.currency}
				isActive={giftCard.isActive}
				existingTags={giftCard.tags.map((item) => item.id)}
				id={giftCard.id}
				disabled={loading}
				{onActiveChange}
				metadata={giftCard.metadata}
			/>
			<GeneralMetadataEditor
				metadata={giftCard.metadata}
				privateMetadata={giftCard.privateMetadata}
				disabled={loading}
				objectId={giftCard.id}
				bind:performUpdateMetadata
			/>
			<div class="p-3 rounded-lg border border-gray-200 bg-white flex flex-col gap-3">
				<SectionHeader>Giftcard timeline</SectionHeader>
				<GiftcardEvents id={giftCard.id} />
			</div>
		</div>
		<GiftcardExtraInformation giftcard={$giftcardQuery.data.giftCard!} />
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
		{onUpdateClick}
		disabled={loading}
		{onDeleteClick}
	/>
{/if}
