<script lang="ts">
	import {
		PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS,
		PROMOTION_RULE_DELETE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { PencilMinus, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		RewardValueTypeEnum,
		type Category,
		type CategoryCountableConnection,
		type Collection,
		type CollectionCountableConnection,
		type Mutation,
		type MutationPromotionRuleDeleteArgs,
		type Product,
		type ProductCountableConnection,
		type ProductVariant,
		type ProductVariantCountableConnection,
		type PromotionRule,
		type PromotionRuleCreateInput,
		type PromotionRuleUpdateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { checkIfGraphqlResultHasError, parseEditorJsString, SitenameCommonClassName } from '$lib/utils/utils';
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
	import { tranFunc } from '$i18n';

	type Props = {
		rules: PromotionRule[];
		onRuleDeleted?: () => void;
	};

	type QueryData = {
		products: ProductCountableConnection;
		productVariants: ProductVariantCountableConnection;
		categories: CategoryCountableConnection;
		collections: CollectionCountableConnection;
	};
	type TabKey = 'products' | 'variants' | 'categories' | 'collections';

	let { rules, onRuleDeleted }: Props = $props();

	let loading = $state(false);

	let ruleActiveTabs = $state<TabKey[]>(new Array(rules.length).fill('products'));
	// let ruleUpdateInput = $state<PromotionRuleUpdateInput>();
	let ruleUpsertInput = $state<PromotionRuleUpdateInput>();

	const rulePredicateQuery = operationStore<QueryData>({
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
			rulePredicateQuery.reexecute({
				variables: {
					productsIds,
					variantsIds,
					categoriesIds,
					collectionsIds,
				},
			});
		}
	});

	const handleDeleteRule = async (ruleId: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionRuleCreate'>,
					MutationPromotionRuleDeleteArgs
				>(PROMOTION_RULE_DELETE_MUTATION, {
					id: ruleId,
				});
				loading = false;

				if (
					checkIfGraphqlResultHasError(
						result,
						'promotionRuleDelete',
						$tranFunc('common.deleteSuccess'),
					)
				)
					return;

				onRuleDeleted?.();
			},
		});
	};

	const handleClickEditRule = (idx: number) => {
		const rule = rules[idx];

		ruleUpsertInput = {
			name: rule.name,
			addChannels: rule.channels?.map(chan => chan.id),
			description: rule.description,
			rewardValue: rule.rewardValue,
			rewardValueType: rule.rewardValueType,
			cataloguePredicate: rule.cataloguePredicate,
		};
	};

	const setActivePredicateTabOfRule = (ruleIdx: number, tabKey: TabKey) => {
		ruleActiveTabs[ruleIdx] = tabKey;
	};

	const handleClickAddRule = () => {
		ruleUpsertInput = {
			name: '',
			addChannels: [],
			rewardValue: 0,
			rewardValueType: RewardValueTypeEnum.Percentage,
			description: { blocks: [] },
			cataloguePredicate: {
				variantPredicate: {},
				productPredicate: {},
				collectionPredicate: {},
				categoryPredicate: {},
			},
		};
	};

	const handleOkUpsertRule = () => {};

	const handleCancelUpsert = () => {
		ruleUpsertInput = undefined;
		// ruleUpdateInput = undefined;
	};

	const classifyRuleCatalog = (
		rule: PromotionRule,
		{ products, productVariants, collections, categories }: QueryData,
	) => {
		let ruleCategories: Category[] = [];
		let ruleProducts: Product[] = [];
		let ruleCollections: Collection[] = [];
		let ruleVariants: ProductVariant[] = [];

		if (rule.cataloguePredicate?.productPredicate?.ids) {
			ruleProducts = products.edges
				.map((edge) => edge.node)
				.filter((prd) => rule.cataloguePredicate?.productPredicate?.ids.includes(prd.id));
		}

		if (rule.cataloguePredicate?.variantPredicate?.ids) {
			ruleVariants = productVariants.edges
				.map((edge) => edge.node)
				.filter((variant) => rule.cataloguePredicate.variantPredicate.ids.includes(variant.id));
		}

		if (rule.cataloguePredicate?.categoryPredicate?.ids) {
			ruleCategories = categories.edges
				.map((edge) => edge.node)
				.filter((cate) => rule.cataloguePredicate.categoryPredicate.ids.includes(cate.id));
		}

		if (rule.cataloguePredicate?.collectionPredicate?.ids) {
			ruleCollections = collections.edges
				.map((edge) => edge.node)
				.filter((col) => rule.cataloguePredicate.collectionPredicate.ids.includes(col.id));
		}

		return { ruleCategories, ruleProducts, ruleVariants, ruleCollections };
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Rules</div>
		<Button endIcon={Plus} size="xs" variant="light" onclick={handleClickAddRule}>Add rule</Button>
	</SectionHeader>

	{#if rules.length}
		<div class="grid grid-cols-2 gap-2 tablet:grid-cols-1">
			{#each rules as rule, ruleIdx (ruleIdx)}
				<div class="rounded-lg border border-gray-200 p-3 space-y-2">
					<SectionHeader>
						<div>Catalog rule</div>
						<div class="flex gap-1.5">
							<IconButton
								size="xs"
								icon={PencilMinus}
								variant="light"
								color="gray"
								disabled={loading}
								onclick={() => handleClickEditRule(ruleIdx)}
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

						{#if $rulePredicateQuery.fetching}
							<TableSkeleton numColumns={4} numOfRows={1} />
						{:else if $rulePredicateQuery.error}
							<Alert size="sm" bordered variant="error">{$rulePredicateQuery.error.message}</Alert>
						{:else if $rulePredicateQuery.data}
							{@const { ruleCategories, ruleCollections, ruleProducts, ruleVariants } =
								classifyRuleCatalog(rule, $rulePredicateQuery.data)}

							<div role="tablist" class="tabs tabs-border tabs-xs">
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'products'}
									onclick={() => setActivePredicateTabOfRule(ruleIdx, 'products')}
									onkeydown={(evt) =>
										evt.key === 'Enter' && setActivePredicateTabOfRule(ruleIdx, 'products')}
								>
									Products ({ruleProducts.length})
								</span>
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'variants'}
									onclick={() => setActivePredicateTabOfRule(ruleIdx, 'variants')}
									onkeydown={(evt) =>
										evt.key === 'Enter' && setActivePredicateTabOfRule(ruleIdx, 'variants')}
								>
									Variants ({ruleVariants.length})
								</span>
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'categories'}
									onclick={() => setActivePredicateTabOfRule(ruleIdx, 'categories')}
									onkeydown={(evt) =>
										evt.key === 'Enter' && setActivePredicateTabOfRule(ruleIdx, 'categories')}
								>
									Categories ({ruleCategories.length})
								</span>
								<span
									role="tab"
									tabindex="0"
									class="tab"
									class:tab-active={ruleActiveTabs[ruleIdx] === 'collections'}
									onclick={() => setActivePredicateTabOfRule(ruleIdx, 'collections')}
									onkeydown={(evt) =>
										evt.key === 'Enter' && setActivePredicateTabOfRule(ruleIdx, 'collections')}
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
	open={!!ruleUpsertInput}
	header="Add promotion rule"
	okText="Add"
	cancelText="Cancel"
	closeOnEscape
	closeOnOutsideClick
	onOk={handleOkUpsertRule}
	onCancel={handleCancelUpsert}
	onClose={handleCancelUpsert}
>
	{#if ruleUpsertInput}
		<RuleEdit
			bind:name={ruleUpsertInput.name!}
			bind:addChannels={ruleUpsertInput.addChannels!}
			bind:rewardValue={ruleUpsertInput.rewardValue!}
			bind:rewardValueType={ruleUpsertInput.rewardValueType!}
			bind:description={ruleUpsertInput.description!}
		/>
	<!-- {:else if ruleCreateInput}
		<RuleEdit
			bind:name={ruleCreateInput.name!}
			bind:addChannels={ruleCreateInput.channels!}
			bind:rewardValue={ruleCreateInput.rewardValue!}
			bind:rewardValueType={ruleCreateInput.rewardValueType!}
			bind:description={ruleCreateInput.description!}
		/> -->
	{/if}
</Modal>
