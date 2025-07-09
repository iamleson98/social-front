<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PROMOTION_DELETE_MUTATION, PROMOTION_DETAIL_QUERY } from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/config/promotions/detail-skeleton.svelte';
	import GeneralInformation from '$lib/components/pages/settings/config/promotions/general-information.svelte';
	import Rules from '$lib/components/pages/settings/config/promotions/rules.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		PromotionTypeEnum,
		type Mutation,
		type MutationPromotionDeleteArgs,
		type PromotionUpdateInput,
		type Query,
		type QueryPromotionArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
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
	});
	let loading = $state(false);
	let promotionType = $state<PromotionTypeEnum>(PromotionTypeEnum.Catalogue);

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

	const handleUpdate = async () => {};

	const handleDelete = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure deleting the promotion ${page.params.id}?`,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionDelete'>,
					MutationPromotionDeleteArgs
				>(PROMOTION_DELETE_MUTATION, {
					id: page.params.id,
				});
				loading = false;

				if (
					!checkIfGraphqlResultHasError(
						result,
						'promotionDelete',
						'Promotion deleted successfully!',
					)
				)
					await goto(AppRoute.SETTINGS_CONFIGS_PROMOTIONS());
			},
		});
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
			{loading}
			bind:description={promotionInput.description}
			bind:startDate={promotionInput.startDate}
			bind:endDate={promotionInput.endDate}
		/>

		<Rules rules={rules || []} />
		<GeneralMetadataEditor objectId={id} {metadata} {privateMetadata} disabled={loading} />
		<ActionBar
			backButtonUrl={AppRoute.SETTINGS_CONFIGS_PROMOTIONS()}
			onDeleteClick={handleDelete}
			onUpdateClick={handleUpdate}
			disabled={loading}
		/>
	</div>
{/if}
