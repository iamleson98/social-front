<script lang="ts">
	import { PROMOTION_RULE_DELETE_MUTATION } from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		RewardValueTypeEnum,
		type Mutation,
		type MutationPromotionRuleDeleteArgs,
		type PromotionRule,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import {
		checkIfGraphqlResultHasError,
		editorJsParser,
		parseEditorJsString,
	} from '$lib/utils/utils';
	import RuleEdit from './rule-edit.svelte';

	type Props = {
		rules: PromotionRule[];
	};

	let { rules }: Props = $props();

	let loading = $state(false);

	type TabProps = {
		name: string;
		key: string;
	};

	let activeTabs = $state<Record<number, number>>({});
	let showRuleEditModal = $state(false);

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
			content: `Are you sure you want to delete the rule ${ruleId}?`,
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

	const setActiveTabs = (ruleIdx: number, tabIdx: number) => {
		activeTabs[ruleIdx] = tabIdx;
	};

	// editorJsParser.parse()
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>
		<div>Rules</div>
		<Button
			endIcon={Plus}
			size="xs"
			variant="outline"
			color="gray"
			onclick={() => (showRuleEditModal = true)}>Add rule</Button
		>
	</SectionHeader>

	{#if rules.length}
		<div class="grid grid-cols-2 gap-2">
			{#each rules as rule, ruleIdx (ruleIdx)}
				<div class="rounded-lg border border-gray-200 p-3 space-y-2">
					<SectionHeader>
						<div>Catalog rule</div>
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
					<div>
						<div class="text-sm font-medium text-gray-700">Name</div>
						<div class="text-xs">{rule.name}</div>
					</div>

					<div>
						<div class="text-sm font-medium text-gray-700">Description</div>
						{#if rule.description}
							<div class="text-xs">
								{#each parseEditorJsString(rule.description) as para, idx (idx)}
									{@html para}
								{/each}
							</div>
						{:else}
							<div>-</div>
						{/if}
					</div>

					<div class="flex items-center justify-between">
						<div class="text-sm font-medium text-gray-700">Discount amount</div>
						<Badge
							text={rule.rewardValueType === RewardValueTypeEnum.Percentage
								? `${rule.rewardValue}%`
								: `${rule.rewardValue} ${rule.channels![0].currencyCode}`}
						/>
					</div>

					<div class="flex items-center justify-between">
						<div class="text-sm font-medium text-gray-700">Apply on channels</div>
						<Badge text={rule.channels?.[0].name || '-'} />
					</div>

					{#if ruleTabs[ruleIdx].length > 0}
						<div role="tablist" class="tabs tabs-border">
							{#each ruleTabs[ruleIdx] as tab, tabIdx (tabIdx)}
								<span
									role="tab"
									tabindex="0"
									class="tab"
									onclick={() => setActiveTabs(ruleIdx, tabIdx)}
									onkeydown={(evt) => evt.key === 'Enter' && setActiveTabs(ruleIdx, tabIdx)}
									class:tab-active={activeTabs[ruleIdx] === tabIdx}>{tab.name}</span
								>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center text-gray-400 text-sm">
			<div>There is no rule, please add more</div>
		</div>
	{/if}
</div>

<Modal
	open={showRuleEditModal}
	header="Add promotion rule"
	okText="Add"
	cancelText="Cancel"
	closeOnEscape
	closeOnOutsideClick
	onOk={() => (showRuleEditModal = false)}
	onCancel={() => (showRuleEditModal = false)}
	onClose={() => (showRuleEditModal = false)}
>
	<RuleEdit />
</Modal>
