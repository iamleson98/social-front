<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		PROMOTION_DELETE_MUTATION,
		PROMOTION_DETAIL_QUERY,
		PROMOTION_UPDATE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import { cleanRulesData } from '$lib/components/pages/settings/promotions/consts';
	import DetailSkeleton from '$lib/components/pages/settings/promotions/detail-skeleton.svelte';
	import GeneralInformation from '$lib/components/pages/settings/promotions/general-information.svelte';
	import Rules from '$lib/components/pages/settings/promotions/rules.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		PromotionTypeEnum,
		type Mutation,
		type MutationPromotionDeleteArgs,
		type MutationPromotionUpdateArgs,
		type PromotionUpdateInput,
		type Query,
		type QueryPromotionArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const promotionStore = operationStore<Pick<Query, 'promotion'>, QueryPromotionArgs>({
		kind: 'query',
		query: PROMOTION_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		requestPolicy: 'cache-and-network',
		pause: !page.params.id,
	});

	let promotionInput = $state<PromotionUpdateInput>({
		name: '',
		description: { blocks: [] },
		startDate: '',
		endDate: '',
	});
	let loading = $state(false);
	let promotionType = $state<PromotionTypeEnum>(PromotionTypeEnum.Catalogue);
	let generalOk = $state(true);
	let performUpdateMetadata = $state(false);

	onMount(() =>
		promotionStore.subscribe((result) => {
			if (!result.data?.promotion) return;

			const { name, description, startDate, endDate, type } = result.data.promotion;

			promotionInput = {
				name,
				description,
				startDate,
				endDate,
			};
			if (type) promotionType = type;
		}),
	);

	const handleUpdate = async () => {
		if (!generalOk) return;

		loading = true;
		performUpdateMetadata = true;

		const promotionUpdate = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'promotionUpdate'>,
			MutationPromotionUpdateArgs
		>(PROMOTION_UPDATE_MUTATION, {
			id: page.params.id!,
			input: promotionInput,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(promotionUpdate, 'promotionUpdate', CommonState.EditSuccess))
			return;

		promotionStore.reexecute({
			variables: { id: page.params.id! },
			context: { requestPolicy: 'network-only' },
		});
	};

	const handleDelete = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionDelete'>,
					MutationPromotionDeleteArgs
				>(PROMOTION_DELETE_MUTATION, {
					id: page.params.id!,
				});
				loading = false;

				if (!checkIfGraphqlResultHasError(result, 'promotionDelete', CommonState.DeleteSuccess))
					await goto(AppRoute.SETTINGS_CONFIGS_PROMOTIONS());
			},
		});
	};

	const handleRefetchPromotion = () => {
		promotionStore.reexecute({ variables: { id: page.params.id! } });
	};
</script>

{#if $promotionStore.fetching}
	<DetailSkeleton />
{:else if $promotionStore.error}
	<Alert size="sm" variant="error" bordered>{$promotionStore.error.message}</Alert>
{:else if $promotionStore.data?.promotion}
	{@const { rules, id, metadata, privateMetadata } = $promotionStore.data.promotion}
	<div class="space-y-2">
		<GeneralInformation
			bind:name={promotionInput.name!}
			type={promotionType}
			disabled={loading}
			bind:description={promotionInput.description}
			bind:startDate={promotionInput.startDate}
			bind:endDate={promotionInput.endDate}
			bind:ok={generalOk}
		/>
		<Rules
			rules={cleanRulesData(rules || [])}
			onRuleDeleted={handleRefetchPromotion}
			onDoneUpsertRule={handleRefetchPromotion}
			promotionId={id}
		/>
		<GeneralMetadataEditor
			objectId={id}
			{metadata}
			{privateMetadata}
			disabled={loading}
			bind:performUpdateMetadata
		/>
		<ActionBar
			backButtonUrl={AppRoute.SETTINGS_CONFIGS_PROMOTIONS()}
			onDeleteClick={handleDelete}
			onUpdateClick={handleUpdate}
			disableUpdateButton={!generalOk}
			disabled={loading}
		/>
	</div>
{/if}
