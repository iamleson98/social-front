<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { GIFT_CARD_DETAIL_QUERY, GIFT_CARD_UPDATE_MUTATION } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailGiftcardSkeleton from '$lib/components/pages/settings/giftcards/detail-giftcard-skeleton.svelte';
	import GiftcardDetail from '$lib/components/pages/settings/giftcards/giftcard-detail.svelte';
	import GiftcardEvents from '$lib/components/pages/settings/giftcards/giftcard-events.svelte';
	import GiftcardExtraInformation from '$lib/components/pages/settings/giftcards/giftcard-extra-information.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/giftcards/utils.svelte';
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
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	const giftcardUtils = new GiftcardUtil();

	let loading = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();

	let timelineReloadTrigger = $state(false);

	const giftcardQuery = operationStore<Pick<Query, 'giftCard'>, QueryGiftCardArgs>({
		query: GIFT_CARD_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id as string,
		},
		pause: !page.params.id,
	});

	let giftcardUpdateInput = $state<GiftCardUpdateInput>({
		removeTags: [],
		addTags: [],
		expiryDate: '',
		balanceAmount: 0,
	});

	onMount(() =>
		giftcardQuery.subscribe((result) => {
			if (!result.data?.giftCard) return;

			const { currentBalance, expiryDate } = result.data.giftCard;

			giftcardUpdateInput = {
				...giftcardUpdateInput,
				balanceAmount: currentBalance.amount,
				expiryDate: expiryDate,
			};
		}),
	);

	const onUpdateClick = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardUpdate'>,
			MutationGiftCardUpdateArgs
		>(GIFT_CARD_UPDATE_MUTATION, { id: page.params.id!, input: giftcardUpdateInput });

		if (checkIfGraphqlResultHasError(result, 'giftCardUpdate')) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate();
		loading = false;
		if (hasErr) return;

		toast.success($CommonState.EditSuccess);
		giftcardQuery.reexecute({
			variables: { id: page.params.id! },
		});
		timelineReloadTrigger = true;
	};

	const onDeleteClick = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const hasError = await giftcardUtils.handleDeleteGiftcard(page.params.id!);
				loading = false;
				if (!hasError) await goto(AppRoute.SETTINGS_CONFIGS_GIFTCARDS());
			},
		});
	};

	const onActiveChange = async (active: boolean) => {
		loading = true;
		const hasError = await giftcardUtils.handleToggleGiftcardStatus(page.params.id!, active);
		loading = false;

		if (!hasError)
			giftcardQuery.reexecute({
				variables: { id: page.params.id! },
			});
	};
</script>

{#if $giftcardQuery.fetching}
	<DetailGiftcardSkeleton />
{:else if $giftcardQuery.error}
	<Alert variant="error" bordered size="sm">{$giftcardQuery.error.message}</Alert>
{:else if $giftcardQuery.data?.giftCard}
	{@const { id, currentBalance, isActive, tags, metadata, privateMetadata, initialBalance } =
		$giftcardQuery.data.giftCard}
	<div class="flex flex-row gap-2 tablet:flex-col">
		<div class="w-7/10 space-y-2 tablet:w-full">
			<GiftcardDetail
				bind:balanceAmount={giftcardUpdateInput.balanceAmount}
				bind:expiryDate={giftcardUpdateInput.expiryDate}
				bind:addTags={giftcardUpdateInput.addTags!}
				bind:removeTags={giftcardUpdateInput.removeTags!}
				balanceCurrency={currentBalance.currency || initialBalance.currency}
				existingTags={tags.map((item) => item.name)}
				disabled={loading}
				{onActiveChange}
				{isActive}
				{metadata}
				{id}
			/>
			<GeneralMetadataEditor
				{metadata}
				{privateMetadata}
				disabled={loading}
				objectId={id}
				bind:this={metaRef}
			/>
			<GiftcardEvents {id} bind:timelineReloadTrigger />
		</div>

		<GiftcardExtraInformation giftcard={$giftcardQuery.data.giftCard} />
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
		{onUpdateClick}
		disabled={loading}
		{onDeleteClick}
	/>
{/if}
