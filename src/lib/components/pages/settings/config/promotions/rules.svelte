<script lang="ts">
	import { PROMOTION_RULE_DELETE_MUTATION } from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
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

	type TabProps = {
		name: string;
		key: string;
	};

	let ruleTabs = $derived(
		rules.reduce(
			(acc, rule, idx) => {
				const res: TabProps[] = [];

				if (!rule.cataloguePredicate) {
					acc[idx] = [];
					return acc;
				}

				if ('variantPredicate' in rule.cataloguePredicate) {
					res.push({
						name: `Variants (${rule.cataloguePredicate.variantPredicate.ids.length})`,
						key: 'variants',
					});
				}
				if ('productPredicate' in rule.cataloguePredicate) {
					res.push({
						name: `Products (${rule.cataloguePredicate.productPredicate.ids.length})`,
						key: 'products',
					});
				}
				if ('categoryPredicate' in rule.cataloguePredicate) {
					res.push({
						name: `Categories (${rule.cataloguePredicate.categoryPredicate.ids.length})`,
						key: 'categories',
					});
				}
				if ('collectionPredicate' in rule.cataloguePredicate) {
					res.push({
						name: `Collections (${rule.cataloguePredicate.collectionPredicate.ids.length})`,
						key: 'collections',
					});
				}

				acc[idx] = res;
				return acc;
			},
			{} as Record<number, TabProps[]>,
		),
	);


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
					<div>Catalog rule: {rule.name}</div>
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
					value={rule.description}
				/>

				<div>
					<div class="text-sm font-medium text-gray-700">Discount amount</div>
					<Badge
						text={rule.rewardValueType === RewardValueTypeEnum.Percentage
							? `${rule.rewardValue}%`
							: `${rule.rewardValue} ${rule.channels![0].currencyCode}`}
					/>
				</div>

				<div>
					<div class="text-sm font-medium text-gray-700">Apply on channels</div>
					<Badge text={rule.channels!.map((channel) => channel.name).join(', ')} />
				</div>

				{#if ruleTabs[idx].length > 0}
					<div role="tablist" class="tabs tabs-border">
						{#each ruleTabs[idx] as tab, idx (idx)}
							<span role="tab" class="tab">{tab.name}</span>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
