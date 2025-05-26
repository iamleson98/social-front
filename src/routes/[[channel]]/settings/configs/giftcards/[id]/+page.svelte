<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { GIFT_CARD_DETAIL_QUERY, GIFT_CARD_UPDATE_MUTATION } from '$lib/api/admin/giftcards';
	import { METADATA_UPDATE_MUTATION, PRIVATE_METADATA_UPDATE_MUTATION } from '$lib/api/admin/metadata';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import DetailGiftcardSkeleton from '$lib/components/pages/settings/config/giftcards/detail-giftcard-skeleton.svelte';
	import GiftcardDetail from '$lib/components/pages/settings/config/giftcards/giftcard-detail.svelte';
	import GiftcardExtraInformation from '$lib/components/pages/settings/config/giftcards/giftcard-extra-information.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/config/giftcards/utils.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { type GiftCardUpdateInput, type MetadataInput, type Mutation, type MutationGiftCardUpdateArgs, type MutationMenuCreateArgs, type MutationUpdateMetadataArgs, type Query, type QueryGiftCardArgs, type UpdateMetadata } from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const giftcardUtils = new GiftcardUtil();

	let loading = $state(false);
	let metadata = $state<MetadataInput[]>([]);
	let privateMetadata = $state<MetadataInput[]>([]);
	let metadataChanged = $state(false);
	let privateMetadataChanged = $state(false);

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

			const { tags, currentBalance, expiryDate, isActive: active, metadata: md, privateMetadata: pmd } =
				result.data.giftCard;

			metadata = [...md];
			privateMetadata = [...pmd];

			giftcardUpdateInput = {
				addTags: [],
				removeTags: [],
				balanceAmount: currentBalance.amount,
				expiryDate: expiryDate,
			};
		}),
	);

	const onUpdateClick = async () => {
		let hasError = false;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardUpdate'>,
			MutationGiftCardUpdateArgs
		>(GIFT_CARD_UPDATE_MUTATION, {
			id: page.params.id,
			input: {
				...giftcardUpdateInput,
			}
		});

		if(metadataChanged) await onUpdateMetadata();

		if(privateMetadataChanged) await onUpdatePrivateMetadata();

		hasError ||= checkIfGraphqlResultHasError(
			result,
			'giftCardUpdate',
			'Gift card updated successfully'
		);

		if (hasError) return;

		metadataChanged = false;
		privateMetadataChanged = false;

		giftcardQuery.reexecute({
			variables: {
				id: page.params.id
			}
		});
	};

	const onUpdateMetadata = async () => {
		let hasError = false;
		loading = true;
		metadata = cleanAndDeduplicateMetadata(metadata);
		const result2 = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'updateMetadata'>,
			MutationUpdateMetadataArgs
		>(METADATA_UPDATE_MUTATION, {
			id: page.params.id,
			input: metadata
		});

		loading = false;

		hasError ||= checkIfGraphqlResultHasError(
			result2,
			'updateMetadata',
			'Gift card metadata updated successfully'
		);

		if (hasError) return;

		metadataChanged = false;

		giftcardQuery.reexecute({
			variables: {
				id: page.params.id
			}
		});
	}

	const onUpdatePrivateMetadata = async () => {
		let hasError = false;
		loading = true;
		privateMetadata = cleanAndDeduplicateMetadata(privateMetadata);
		const result2 = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'updatePrivateMetadata'>,
			MutationUpdateMetadataArgs
		>(PRIVATE_METADATA_UPDATE_MUTATION, {
			id: page.params.id,
			input: privateMetadata
		});

		loading = false;

		hasError ||= checkIfGraphqlResultHasError(
			result2,
			'updatePrivateMetadata',
			'Gift card private metadata updated successfully'
		);

		if (hasError) return;

		privateMetadataChanged = false;

		giftcardQuery.reexecute({
			variables: {
				id: page.params.id
			}
		});
	}

	function cleanAndDeduplicateMetadata(data: MetadataInput[]): MetadataInput[] {
		const seen = new Set<string>();
		const result: MetadataInput[] = [];

		for (let i = data.length - 1; i >= 0; i--) {
			const { key, value } = data[i];
			if (!seen.has(key)) {
				seen.add(key);
				result.unshift({ key, value });
			}
		}

		return result;
	}

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
		<GiftcardDetail
			bind:balanceAmount={giftcardUpdateInput.balanceAmount}
			balanceCurrency={giftCard.currentBalance.currency || giftCard.initialBalance.currency}
			bind:expiryDate={giftcardUpdateInput.expiryDate}
			isActive={giftCard.isActive}
			bind:addTags={giftcardUpdateInput.addTags!}
			bind:removeTags={giftcardUpdateInput.removeTags!}
			bind:metadata={metadata}
			bind:privateMetadata={privateMetadata}
			id={giftCard.id}
			{onActiveChange}
			bind:metadataChanged={metadataChanged}
			bind:privateMetadataChanged={privateMetadataChanged}
			disabled={loading}
		/>
		<GiftcardExtraInformation giftcard={$giftcardQuery.data.giftCard!} />
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
		{onUpdateClick}
		disabled={loading}
		{onDeleteClick}
	/>
{/if}
