<script lang="ts">
	import { PROMOTION_RULE_DELETE_MUTATION } from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import {
		RewardValueTypeEnum,
		type Mutation,
		type MutationPromotionRuleDeleteArgs,
		type PromotionRule,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	type Props = {
		rules: PromotionRule[];
	};

	let { rules }: Props = $props();

	let loading = $state(false);

	const handleDeleteRule = async (ruleId: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure deleting the rule ${ruleId}?`,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionRuleCreate'>,
					MutationPromotionRuleDeleteArgs
				>(PROMOTION_RULE_DELETE_MUTATION, {
					id: ruleId,
				});
				loading = false;

				checkIfGraphqlResultHasError(result, 'promotionRuleDelete', 'Rule deleted successfully!');
			},
		});
	};

	const handleEditRule = (ruleId: string) => {
		// goto(AppRoute.PromotionsEdit(ruleId));
	};
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>
		<div>Rules</div>
		<Button endIcon={Plus} size="xs" variant="outline" color="gray">Add rule</Button>
	</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		{#each rules as rule, idx (idx)}
			<div class="rounded-lg border border-gray-200 p-3 space-y-3">
				<SectionHeader>
					<div>Catelogue rule: {rule.name}</div>
					<div class="flex gap-1.5">
						<IconButton
							size="xs"
							icon={Edit}
							variant="light"
							disabled={loading}
							onclick={() => handleEditRule(rule.id)}
						/>
						<IconButton
							size="xs"
							icon={Trash}
							color="red"
							variant="light"
							disabled={loading}
							onclick={() => handleDeleteRule(rule.id)}
						/>
					</div>
				</SectionHeader>
				<EditorJSComponent
					label="Catalogue rule description"
					placeholder="Catalogue rule description"
					size="sm"
					value={rule.description}
				/>

				<div>
					<div>Discount amount</div>
					<PriceDisplay
						amount={rule.rewardValue}
						currency={rule.rewardValueType === RewardValueTypeEnum.Percentage
							? '%'
							: rule.channels![0].currencyCode}
					/>
				</div>
			</div>
		{/each}
	</div>
</div>
