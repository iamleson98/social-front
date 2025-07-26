<script lang="ts">
	import {
		PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS,
		PROMOTION_RULE_DELETE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		RewardValueTypeEnum,
		type CategoryCountableConnection,
		type CollectionCountableConnection,
		type Mutation,
		type MutationPromotionRuleDeleteArgs,
		type ProductCountableConnection,
		type ProductVariantCountableConnection,
		type PromotionRule,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { checkIfGraphqlResultHasError, parseEditorJsString } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import RuleEdit from './rule-edit.svelte';
	import { Table, TableSkeleton } from '$lib/components/ui/Table';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		CATEGORY_COLUMNS,
		COLLECTION_COLUMNS,
		PRODUCT_COLUMNS,
		VARIANT_COLUMNS,
	} from '../vouchers/snippets.svelte';

	type Props = {
		rules: PromotionRule[];
	};

	type QueryData = {
		products: ProductCountableConnection;
		productVariants: ProductVariantCountableConnection;
		categories: CategoryCountableConnection;
		collections: CollectionCountableConnection;
	};
	type TabKey = 'products' | 'variants' | 'categories' | 'collections';

	let { rules }: Props = $props();

	let loading = $state(false);

	type TabProps = {
		name: string;
		key: string;
	};

	let activeTabs = $state<Record<number, number>>({});
	let showRuleEditModal = $state(false);
	let ruleActiveTabs = $state<TabKey[]>(new Array(rules.length).fill('products'));

	const predicateQuery = operationStore<QueryData>({
		kind: 'query',
		query: PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS,
		variables: {},
		pause: true,
	});

	onMount(() => {
		const productsIds = [];
		const variantsIds = [];
		const categoriesIds = [];
		const collectionsIds = [];

		for (const rule of rules) {
			if ('variantPredicate' in rule.cataloguePredicate) {
				variantsIds.push(...rule.cataloguePredicate.variantPredicate.ids);
			}
			if ('productPredicate' in rule.cataloguePredicate) {
				productsIds.push(...rule.cataloguePredicate.productPredicate.ids);
			}
			if ('categoryPredicate' in rule.cataloguePredicate) {
				categoriesIds.push(...rule.cataloguePredicate.categoryPredicate.ids);
			}
			if ('collectionPredicate' in rule.cataloguePredicate) {
				collectionsIds.push(...rule.cataloguePredicate.collectionPredicate.ids);
			}
		}

		if (productsIds.length || variantsIds.length || categoriesIds.length || collectionsIds.length) {
			predicateQuery.reexecute({
				variables: {
					productsIds,
					variantsIds,
					categoriesIds,
					collectionsIds,
				},
			});
		}
	});

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

	const setActiveTabs = (ruleIdx: number, tabKey: TabKey) => {
		ruleActiveTabs[ruleIdx] = tabKey;
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

					<div class="space-y-2">
						<div class="text-sm font-medium text-gray-700">Predicates</div>

						{#if $predicateQuery.fetching}
							<TableSkeleton numColumns={4} numOfRows={1} />
						{:else if $predicateQuery.error}
							<Alert size="sm" bordered variant="error">{$predicateQuery.error.message}</Alert>
						{:else if $predicateQuery.data}
							{@const products = $predicateQuery.data.products.edges.map((edge) => edge.node)}
							{@const productVariants = $predicateQuery.data.productVariants.edges.map(
								(edge) => edge.node,
							)}
							{@const categories = $predicateQuery.data.categories.edges.map((edge) => edge.node)}
							{@const collections = $predicateQuery.data.collections.edges.map((edge) => edge.node)}

							{@const ruleProducts = rule.cataloguePredicate?.productPredicate?.ids
								? products.filter((product) =>
										rule.cataloguePredicate?.productPredicate?.ids.includes(product.id),
									)
								: []}
							{@const ruleVariants = rule.cataloguePredicate?.variantPredicate?.ids
								? productVariants.filter((variant) =>
										rule.cataloguePredicate?.variantPredicate?.ids.includes(variant.id),
									)
								: []}
							{@const ruleCategories = rule.cataloguePredicate?.categoryPredicate?.ids
								? categories.filter((category) =>
										rule.cataloguePredicate?.categoryPredicate?.ids.includes(category.id),
									)
								: []}
							{@const ruleCollections = rule.cataloguePredicate?.collectionPredicate?.ids
								? collections.filter((collection) =>
										rule.cataloguePredicate?.collectionPredicate?.ids.includes(collection.id),
									)
								: []}

							<div role="tablist" class="tabs tabs-border tabs-sm">
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'products'}
									onclick={() => setActiveTabs(ruleIdx, 'products')}
									onkeydown={(evt) => evt.key === 'Enter' && setActiveTabs(ruleIdx, 'products')}
								>
									Products ({ruleProducts.length})
								</span>
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'variants'}
									onclick={() => setActiveTabs(ruleIdx, 'variants')}
									onkeydown={(evt) => evt.key === 'Enter' && setActiveTabs(ruleIdx, 'variants')}
								>
									Variants ({ruleVariants.length})
								</span>
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'categories'}
									onclick={() => setActiveTabs(ruleIdx, 'categories')}
									onkeydown={(evt) => evt.key === 'Enter' && setActiveTabs(ruleIdx, 'categories')}
								>
									Categories ({ruleCategories.length})
								</span>
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'collections'}
									onclick={() => setActiveTabs(ruleIdx, 'collections')}
									onkeydown={(evt) => evt.key === 'Enter' && setActiveTabs(ruleIdx, 'collections')}
								>
									Collections ({ruleCollections.length})
								</span>
							</div>

							{#if ruleActiveTabs[ruleIdx] === 'categories'}
								<Table columns={CATEGORY_COLUMNS} items={ruleCategories} />
							{:else if ruleActiveTabs[ruleIdx] === 'collections'}
								<Table columns={COLLECTION_COLUMNS} items={ruleCollections} />
							{:else if ruleActiveTabs[ruleIdx] === 'products'}
								<Table columns={PRODUCT_COLUMNS} items={ruleProducts} />
							{:else if ruleActiveTabs[ruleIdx] === 'variants'}
								<Table columns={VARIANT_COLUMNS} items={ruleVariants} />
							{/if}
						{/if}
					</div>
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
