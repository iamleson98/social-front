<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		PROMOTION_CREATE_MUTATION,
		PROMOTION_RULE_CREATE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import CreatePageRules from '$lib/components/pages/settings/promotions/create-page-rules.svelte';
	import GeneralInformation from '$lib/components/pages/settings/promotions/general-information.svelte';
	import {
		PromotionTypeEnum,
		type Mutation,
		type MutationPromotionCreateArgs,
		type MutationPromotionRuleCreateArgs,
		type PromotionCreateInput,
		type PromotionRuleCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';

	let promotionInput = $state<PromotionCreateInput>({
		name: '',
		type: PromotionTypeEnum.Catalogue,
		description: { blocks: [] },
		startDate: '',
		endDate: '',
	});
	let loading = $state(false);
	let generalOk = $state(true);
	let addRules = $state<PromotionRuleCreateInput[]>([]);
	let createdPromotionId = $state<string>('');
	let metadataRef = $state<any>();

	const handleCreate = async () => {
		loading = true;

		const promotionCreateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'promotionCreate'>,
			MutationPromotionCreateArgs
		>(PROMOTION_CREATE_MUTATION, {
			input: promotionInput,
		});
		if (checkIfGraphqlResultHasError(promotionCreateResult, 'promotionCreate')) {
			loading = false;
			return;
		}

		// perform create metadatas
		createdPromotionId = promotionCreateResult.data?.promotionCreate?.promotion?.id as string;
		const hasError = await metadataRef.handleUpdate();
		if (hasError) {
			loading = false;
			return;
		}

		// perform create rules
		const ruleCreationTasks = addRules.map((ruleInput) =>
			GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'promotionRuleCreate'>,
				MutationPromotionRuleCreateArgs
			>(PROMOTION_RULE_CREATE_MUTATION, {
				input: {
					...ruleInput,
					promotion: createdPromotionId,
				},
			}).toPromise(),
		);

		const rulesCreationResults = await Promise.all(ruleCreationTasks);
		if (
			rulesCreationResults.some((result) =>
				checkIfGraphqlResultHasError(result, 'promotionRuleCreate'),
			)
		) {
			loading = false;
			return;
		}

		toast.success(CommonState.CreateSuccess);
		await goto(AppRoute.SETTINGS_CONFIGS_PROMOTION_DETAIL(createdPromotionId));
	};
</script>

<div class="space-y-2">
	<GeneralInformation
		bind:name={promotionInput.name!}
		bind:type={promotionInput.type}
		bind:description={promotionInput.description}
		bind:startDate={promotionInput.startDate}
		bind:endDate={promotionInput.endDate}
		disabled={loading}
		isCreatePage
		bind:ok={generalOk}
	/>
	<CreatePageRules bind:rules={addRules} />
	<GeneralMetadataEditor
		objectId={createdPromotionId}
		disabled={loading}
		metadata={[]}
		privateMetadata={[]}
		bind:this={metadataRef}
	/>
	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_PROMOTIONS()}
		onAddClick={handleCreate}
		disabled={loading}
		disableCreateButton={!generalOk}
	/>
</div>
