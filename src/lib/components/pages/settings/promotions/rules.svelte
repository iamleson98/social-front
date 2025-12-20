<script lang="ts">
	import { T } from '$i18n';
	import {
		PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS_QUERY,
		PROMOTION_RULE_CREATE_MUTATION,
		PROMOTION_RULE_DELETE_MUTATION,
		PROMOTION_RULE_UPDATE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { PencilMinus, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import { Table, TableSkeleton } from '$lib/components/ui/Table';
	import {
		RewardValueTypeEnum,
		type Mutation,
		type MutationPromotionRuleCreateArgs,
		type MutationPromotionRuleDeleteArgs,
		type MutationPromotionRuleUpdateArgs,
		type PromotionRule,
		type PromotionRuleUpdateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { CommonState } from '$lib/utils/common.svelte';
	import {
		checkIfGraphqlResultHasError,
		parseEditorJsString,
		SitenameCommonClassName,
	} from '$lib/utils/utils';
	import {
		CATEGORY_COLUMNS,
		COLLECTION_COLUMNS,
		PRODUCT_COLUMNS,
		VARIANT_COLUMNS,
	} from '../vouchers/snippets.svelte';
	import {
		classifyRuleCatalog,
		createDefaultCatalogPredicate,
		type QueryData,
		type TabKey,
	} from './consts';
	import RuleEdit from './rule-edit.svelte';
	import { omit } from 'es-toolkit';
	import { onMount } from 'svelte';

	type Props = {
		/** pass in this prop in promotion detail page */
		rules?: PromotionRule[];
		onRuleDeleted?: () => void;
		/** if not provided, meanings current page is promotion create page */
		promotionId?: string;
		onDoneUpsertRule?: () => void;
	};

	let { rules = [], onRuleDeleted, promotionId, onDoneUpsertRule }: Props = $props();

	let loading = $state(false);
	let rulesActiveCatalogueTabs = $state<TabKey[]>(new Array(rules.length).fill('products'));
	let ruleUpsertInput = $state<PromotionRuleUpdateInput & { id?: string }>();

	const RulePredicateQuery = operationStore<QueryData>({
		query: PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS_QUERY,
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
			RulePredicateQuery.reexecute({
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
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionRuleDelete'>,
					MutationPromotionRuleDeleteArgs
				>(PROMOTION_RULE_DELETE_MUTATION, {
					id: ruleId,
				});
				loading = false;

				if (checkIfGraphqlResultHasError(result, 'promotionRuleDelete', $CommonState.DeleteSuccess))
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
			cataloguePredicate: {
				...createDefaultCatalogPredicate(),
				...(rule.cataloguePredicate || {}),
			},
		};
	};

	const setActivePredicateTabOfRule = (ruleIdx: number, tabKey: TabKey) => {
		rulesActiveCatalogueTabs[ruleIdx] = tabKey;
	};

	const handleClickAddRule = () => {
		ruleUpsertInput = {
			name: '',
			addChannels: [],
			rewardValue: 0,
			rewardValueType: RewardValueTypeEnum.Percentage,
			description: { blocks: [] },
			cataloguePredicate: { ...createDefaultCatalogPredicate() },
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
			if (checkIfGraphqlResultHasError(result, 'promotionRuleUpdate', $CommonState.EditSuccess))
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
				if (checkIfGraphqlResultHasError(result, 'promotionRuleCreate', $CommonState.CreateSuccess))
					return;

				handleDoneUpsertRule();
			}
		}
	};

	const handleCancelUpsert = () => {
		ruleUpsertInput = undefined;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$T('promotion.rules')}</div>
		<Button endIcon={Plus} size="xs" variant="light" onclick={handleClickAddRule}
			>{$T('promotion.addRule')}</Button
		>
	</SectionHeader>

	{#if rules.length}
		<div class="grid grid-cols-2 gap-2 tablet:grid-cols-1">
			{#each rules as rule, ruleIdx (ruleIdx)}
				<div class={SitenameCommonClassName}>
					<SectionHeader>
						<div>{$T('promotion.catalogRule')}</div>
						<div class="flex gap-1.5">
							<IconButton
								size="xs"
								icon={PencilMinus}
								variant="light"
								color="gray"
								disabled={loading}
								onclick={() => handleClickEditRule(ruleIdx)}
								aria-label='Edit'
							/>
							<IconButton
								size="xs"
								icon={Trash}
								color="red"
								variant="light"
								disabled={loading}
								onclick={() => handleDeleteRule(rule.id)}
								aria-label='Delete'
							/>
						</div>
					</SectionHeader>
					<div>
						<div class="text-sm font-medium text-gray-700">{$T('common.name')}</div>
						<div class="text-xs">{rule.name}</div>
					</div>

					<div>
						<div class="text-sm font-medium text-gray-700">{$T('settings.description')}</div>
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
						<div class="text-sm font-medium text-gray-700">
							{$T('voucher.discountValue')}
						</div>
						<Badge
							text={rule.rewardValueType === RewardValueTypeEnum.Percentage
								? `${rule.rewardValue}%`
								: `${rule.rewardValue} ${rule.channels![0].currencyCode}`}
						/>
					</div>

					<div class="flex items-center justify-between">
						<div class="text-sm font-medium text-gray-700">{$T('promotion.applyChans')}</div>
						<Badge text={rule.channels?.[0].name || '-'} />
					</div>

					<div class="space-y-2">
						<div class="text-sm font-medium text-gray-700">{$T('promotion.predicates')}</div>

						{#if $RulePredicateQuery.fetching}
							<TableSkeleton numColumns={4} numOfRows={1} />
						{:else if $RulePredicateQuery.error}
							<Alert size="sm" bordered variant="error">{$RulePredicateQuery.error.message}</Alert>
						{:else if $RulePredicateQuery.data}
							{@const { ruleCategories, ruleCollections, ruleProducts, ruleVariants } =
								classifyRuleCatalog(rule.cataloguePredicate, $RulePredicateQuery.data)}
							{@const TABS: {key: TabKey, display: string}[] = [
								{
									key: 'products',
									display: `${$T('common.products')} (${ruleProducts.length})`
								},
								{
									key: 'variants',
									display: `${$T('common.variants')} (${ruleVariants.length})`,
								},
								{
									key: 'collections',
									display: `${$T('common.collections')} (${ruleCollections.length})`,
								},
								{
									key: 'categories',
									display: `${$T('common.categories')} (${ruleCategories.length})`,
								}
							]}
							<div role="tablist" class="tabs tabs-border tabs-xs">
								{#each TABS as tab, idx (idx)}
									<span
										role="tab"
										tabindex="0"
										class="tab"
										class:tab-active={rulesActiveCatalogueTabs[ruleIdx] === tab.key}
										onclick={() => setActivePredicateTabOfRule(ruleIdx, tab.key)}
										onkeydown={(evt) =>
											evt.key === 'Enter' && setActivePredicateTabOfRule(ruleIdx, tab.key)}
									>
										{tab.display}
									</span>
								{/each}
							</div>

							{#if rulesActiveCatalogueTabs[ruleIdx] === 'categories'}
								<Table
									columns={CATEGORY_COLUMNS(
										$T('common.pic'),
										$T('product.cateName'),
										$T('collection.noOfPrds'),
									)}
									items={ruleCategories}
								/>
							{:else if rulesActiveCatalogueTabs[ruleIdx] === 'collections'}
								<Table
									columns={COLLECTION_COLUMNS(
										$T('common.pic'),
										$T('common.name'),
										$T('collection.noOfPrds'),
									)}
									items={ruleCollections}
								/>
							{:else if rulesActiveCatalogueTabs[ruleIdx] === 'products'}
								<Table
									columns={PRODUCT_COLUMNS(
										$T('common.pic'),
										$T('product.prdName'),
										$T('product.prdType'),
										$T('settings.availability'),
									)}
									items={ruleProducts}
								/>
							{:else if rulesActiveCatalogueTabs[ruleIdx] === 'variants'}
								<Table
									columns={VARIANT_COLUMNS(
										$T('common.pic'),
										$T('product.prdName'),
										$T('product.variantName'),
									)}
									items={ruleVariants}
								/>
							{/if}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center text-gray-400 text-sm">
			<div>{$T('promotion.noRuleHint')}</div>
		</div>
	{/if}
</div>

<Modal
	open={!!ruleUpsertInput}
	header={$T('promotion.upsertRule')}
	okText={ruleUpsertInput?.id ? $T('btn.update') : $T('btn.create')}
	cancelText={$T('common.cancel')}
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
