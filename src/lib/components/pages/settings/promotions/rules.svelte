<script lang="ts">
	import {
		PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS,
		PROMOTION_RULE_CREATE_MUTATION,
		PROMOTION_RULE_DELETE_MUTATION,
		PROMOTION_RULE_UPDATE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { PencilMinus, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		RewardValueTypeEnum,
		type Category,
		type CategoryCountableConnection,
		type Collection,
		type CollectionCountableConnection,
		type Mutation,
		type MutationPromotionRuleCreateArgs,
		type MutationPromotionRuleDeleteArgs,
		type MutationPromotionRuleUpdateArgs,
		type Product,
		type ProductCountableConnection,
		type ProductVariant,
		type ProductVariantCountableConnection,
		type PromotionRule,
		type PromotionRuleCreateInput,
		type PromotionRuleUpdateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import {
		checkIfGraphqlResultHasError,
		parseEditorJsString,
		SitenameCommonClassName,
	} from '$lib/utils/utils';
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
	import { DefaultCatalogPredicate, type TabKey } from './consts';
	import { omit } from 'es-toolkit';
	import { CommonState } from '$lib/utils/common.svelte';

	type Props = {
		/** pass in this prop in promotion detail page */
		rules?: PromotionRule[];
		/** pass in the prop when in create page */
		addRules?: PromotionRuleCreateInput[];
		onRuleDeleted?: () => void;
		/** if not provided, meanings current page is promotion create page */
		promotionId?: string;
		onDoneUpsertRule?: () => void;
	};

	type QueryData = {
		products: ProductCountableConnection;
		productVariants: ProductVariantCountableConnection;
		categories: CategoryCountableConnection;
		collections: CollectionCountableConnection;
	};

	let {
		rules = [],
		onRuleDeleted,
		promotionId,
		onDoneUpsertRule,
		addRules = $bindable(),
	}: Props = $props();

	let loading = $state(false);
	let ruleActiveTabs = $state<TabKey[]>(new Array(rules.length).fill('products'));
	let ruleUpsertInput = $state<PromotionRuleUpdateInput & { id?: string }>();

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
					Pick<Mutation, 'promotionRuleDelete'>,
					MutationPromotionRuleDeleteArgs
				>(PROMOTION_RULE_DELETE_MUTATION, {
					id: ruleId,
				});
				loading = false;

				if (checkIfGraphqlResultHasError(result, 'promotionRuleDelete', CommonState.DeleteSuccess))
					return;

				onRuleDeleted?.();
			},
		});
	};

	const handleClickEditRule = (idx: number) => {
		const rule = rules[idx];

		ruleUpsertInput = {
			id: rule.id, // to help update
			name: rule.name,
			addChannels: rule.channels?.map((chan) => chan.id),
			description: rule.description,
			rewardValue: rule.rewardValue,
			rewardValueType: rule.rewardValueType,
			cataloguePredicate: { ...DefaultCatalogPredicate, ...(rule.cataloguePredicate || {}) },
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
			cataloguePredicate: { ...DefaultCatalogPredicate },
		};
	};

	const handleDoneUpsertRule = () => {
		ruleUpsertInput = undefined;
		onDoneUpsertRule?.();
	};

	const handleOkUpsertRule = async () => {
		if (!ruleUpsertInput) return;

		loading = true;

		if (ruleUpsertInput.id) {
			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'promotionRuleUpdate'>,
				MutationPromotionRuleUpdateArgs
			>(PROMOTION_RULE_UPDATE_MUTATION, {
				id: ruleUpsertInput.id,
				input: omit(ruleUpsertInput, ['id']),
			});

			loading = false;
			if (checkIfGraphqlResultHasError(result, 'promotionRuleUpdate', CommonState.EditSuccess))
				return;

			handleDoneUpsertRule();
		} else {
			if (promotionId) {
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionRuleCreate'>,
					MutationPromotionRuleCreateArgs
				>(PROMOTION_RULE_CREATE_MUTATION, {
					input: {
						name: ruleUpsertInput.name,
						description: ruleUpsertInput.description,
						promotion: promotionId,
						cataloguePredicate: ruleUpsertInput.cataloguePredicate,
						channels: ruleUpsertInput.addChannels,
						rewardType: ruleUpsertInput.rewardType,
						rewardValue: ruleUpsertInput.rewardValue,
						rewardValueType: ruleUpsertInput.rewardValueType,
					},
				});

				loading = false;
				if (checkIfGraphqlResultHasError(result, 'promotionRuleCreate', CommonState.CreateSuccess))
					return;

				handleDoneUpsertRule();
			} else {
				// in prmotion creation page, we just append new rules to the given list, parent will handle them
				addRules?.push({
					name: ruleUpsertInput.name,
					description: ruleUpsertInput.description,
					channels: ruleUpsertInput.addChannels,
					cataloguePredicate: ruleUpsertInput.cataloguePredicate,
					promotion: '', // leave this empty, so the parent page will handle
					rewardType: ruleUpsertInput.rewardType,
					rewardValue: ruleUpsertInput.rewardValue,
					rewardValueType: ruleUpsertInput.rewardValueType,
				});
			}
		}
	};

	const handleCancelUpsert = () => {
		ruleUpsertInput = undefined;
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
				<div class={SitenameCommonClassName}>
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
							{@const tabs: {key: TabKey, display: string}[] = [
								{
									key: 'products',
									display: `Products (${ruleProducts.length})`
								},
								{
									key: 'variants',
									display: `Variants (${ruleVariants.length})`,
								},
								{
									key: 'collections',
									display: `Collections (${ruleCollections.length})`,
								},
								{
									key: 'categories',
									display: `Categories (${ruleCategories.length})`,
								}
							]}
							<div role="tablist" class="tabs tabs-border tabs-xs">
								{#each tabs as tab, idx (idx)}
									<span
										role="tab"
										tabindex="0"
										class="tab"
										class:tab-active={ruleActiveTabs[ruleIdx] === tab.key}
										onclick={() => setActivePredicateTabOfRule(ruleIdx, tab.key)}
										onkeydown={(evt) =>
											evt.key === 'Enter' && setActivePredicateTabOfRule(ruleIdx, tab.key)}
									>
										{tab.display}
									</span>
								{/each}
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
	header="Upsert promotion rule"
	okText={ruleUpsertInput?.id ? 'Update' : 'Create'}
	cancelText="Cancel"
	closeOnEscape
	closeOnOutsideClick
	disableElements={loading}
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
			bind:catalogPredicate={ruleUpsertInput.cataloguePredicate!}
			disabled={loading}
		/>
	{/if}
</Modal>
