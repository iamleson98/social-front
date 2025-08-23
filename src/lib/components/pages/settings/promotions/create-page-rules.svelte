<script lang="ts">
	import { PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS } from '$lib/api/admin/discount';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { PencilMinus, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import { Table, TableSkeleton } from '$lib/components/ui/Table';
	import {
		RewardTypeEnum,
		RewardValueTypeEnum,
		type Category,
		type Collection,
		type Product,
		type ProductVariant,
		type PromotionRuleCreateInput,
		type Query,
	} from '$lib/gql/graphql';
	import { parseEditorJsString, SitenameCommonClassName } from '$lib/utils/utils';
	import { difference } from 'es-toolkit';
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
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { Alert } from '$lib/components/ui/Alert';

	type Props = {
		rules: PromotionRuleCreateInput[];
		disabled?: boolean;
	};

	let { rules = $bindable(), disabled }: Props = $props();

	$inspect(rules);

	let selectedProducts = $state<Record<string, Product>>({});
	let selectedVariants = $state<Record<string, ProductVariant>>({});
	let selectedCategories = $state<Record<string, Category>>({});
	let selectedCollections = $state<Record<string, Collection>>({});

	const RulePredicateQuery = operationStore<QueryData>({
		query: PROMOTION_RULE_CONDITIONS_SELECTED_OPTIONS_DETAILS,
		variables: {},
		pause: true,
		requestPolicy: 'cache-and-network',
	});

	const ChannelsQuery = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-first',
	});

	let ruleActiveTabs = $state<TabKey[]>(new Array(rules.length).fill('products'));
	let ruleCreateInput = $state<PromotionRuleCreateInput>();
	let openEditingModal = $state(false);

	const handleDeleteRule = async (ruleIdx: number) => {
		rules = rules.filter((_, idx) => idx !== ruleIdx);
	};

	const handleClickAddAnotherRule = () => {
		ruleCreateInput = {
			promotion: '',
			cataloguePredicate: createDefaultCatalogPredicate(),
			channels: [],
			description: { blocks: [] },
			name: '',
			rewardType: RewardTypeEnum.SubtotalDiscount,
			rewardValue: 0,
			rewardValueType: RewardValueTypeEnum.Fixed,
		};
		openEditingModal = true;
	};

	const setActivePredicateTabOfRule = (ruleIdx: number, tabKey: TabKey) => {
		ruleActiveTabs[ruleIdx] = tabKey;
	};

	const handleDoneEditingRule = () => {
		if (!ruleCreateInput) return;

		// add catalogue predicate informations
		const productsIdDifferences = difference(
			ruleCreateInput?.cataloguePredicate?.productPredicate?.ids || [],
			Object.keys(selectedProducts),
		);
		for (const id of productsIdDifferences)
			if (!selectedProducts[id]) selectedProducts[id] = null as unknown as Product;

		const productVariantsIdDifferences = difference(
			ruleCreateInput?.cataloguePredicate?.variantPredicate?.ids || [],
			Object.keys(selectedVariants),
		);
		for (const id of productVariantsIdDifferences)
			if (!selectedVariants[id]) selectedVariants[id] = null as unknown as ProductVariant;

		const categoryIdsDifferences = difference(
			ruleCreateInput?.cataloguePredicate?.categoryPredicate?.ids || [],
			Object.keys(selectedCategories),
		);
		for (const id of categoryIdsDifferences)
			if (!selectedCategories[id]) selectedCategories[id] = null as unknown as Category;

		const collectionIdsDifferences = difference(
			ruleCreateInput?.cataloguePredicate?.collectionPredicate?.ids || [],
			Object.keys(selectedCollections),
		);
		for (const id of collectionIdsDifferences)
			if (!selectedCollections[id]) selectedCollections[id] = null as unknown as Collection;

		// decide whether to refetch catalogue informations
		if (
			productsIdDifferences.length ||
			productVariantsIdDifferences.length ||
			categoryIdsDifferences.length ||
			collectionIdsDifferences.length
		)
			RulePredicateQuery.reexecute({
				variables: {
					productsIds: Object.keys(selectedProducts),
					variantsIds: Object.keys(selectedVariants),
					categoriesIds: Object.keys(selectedCategories),
					collectionsIds: Object.keys(selectedCollections),
				},
			});

		rules = rules.concat(ruleCreateInput);
		openEditingModal = false; // close modal
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Rules</div>
		<Button endIcon={Plus} size="xs" variant="light" onclick={handleClickAddAnotherRule}>
			Add rule
		</Button>
	</SectionHeader>

	<div class="grid grid-cols-2 gap-2 tablet:grid-cols-1">
		{#if $ChannelsQuery.fetching}
			<div class="grid grid-cols-2 gap-2">
				<TableSkeleton numOfRows={4} numColumns={1} />
				<TableSkeleton numColumns={1} numOfRows={4} />
			</div>
		{:else if $ChannelsQuery.error}
			<Alert size="sm" variant="error">{$ChannelsQuery.error.message}</Alert>
		{:else if $ChannelsQuery.data?.channels}
			{@const { channels } = $ChannelsQuery.data}
			{#each rules as rule, ruleIdx (ruleIdx)}
				{@const channelInfo = rule.channels?.length
					? channels.find((chan) => chan.id === rule.channels?.[0])
					: undefined}
				<div class={SitenameCommonClassName}>
					<SectionHeader>
						<div>Catalog rule</div>
						<div class="flex gap-1.5">
							<IconButton
								size="xs"
								icon={PencilMinus}
								variant="light"
								color="gray"
								{disabled}
								onclick={() => {
									ruleCreateInput = rule;
									openEditingModal = true;
								}}
							/>
							<IconButton
								size="xs"
								icon={Trash}
								color="red"
								variant="light"
								{disabled}
								onclick={() => handleDeleteRule(ruleIdx)}
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
								: `${rule.rewardValue} ${channelInfo ? channelInfo.currencyCode : '?'}`}
						/>
					</div>

					<div class="flex items-center justify-between">
						<div class="text-sm font-medium text-gray-700">Apply on channels</div>
						<Badge text={channelInfo ? channelInfo.name : '?'} />
					</div>

					<div class="space-y-2">
						<div class="text-sm font-medium text-gray-700">Predicates</div>

						{#if $RulePredicateQuery.fetching}
							<TableSkeleton numColumns={4} numOfRows={1} />
						{:else if $RulePredicateQuery.error}
							<Alert size="sm" bordered variant="error">{$RulePredicateQuery.error.message}</Alert>
						{:else if $RulePredicateQuery.data}
							{@const { ruleCategories, ruleCollections, ruleProducts, ruleVariants } =
								classifyRuleCatalog(rule.cataloguePredicate!, $RulePredicateQuery.data)}
							{@const tabs: {key: TabKey, display: string}[] = [
								{
									key: 'products',
									display: `Products ${ruleProducts.length}`
								},
								{
									key: 'variants',
									display: `Variants ${ruleVariants.length}`,
								},
								{
									key: 'collections',
									display: `Collections ${ruleCollections.length}`,
								},
								{
									key: 'categories',
									display: `Categories ${ruleCategories.length}`,
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
		{/if}
	</div>

	{#if !rules.length}
		<div class="text-center text-gray-400 text-sm">
			<div>There is no rule, please add more</div>
		</div>
	{/if}
</div>

<Modal
	open={openEditingModal}
	header="Upsert promotion rule"
	okText={'Create'}
	cancelText="Cancel"
	disableElements={disabled}
	onOk={handleDoneEditingRule}
	onCancel={() => (openEditingModal = false)}
	onClose={() => (openEditingModal = false)}
>
	{#if ruleCreateInput}
		<RuleEdit
			bind:name={ruleCreateInput.name!}
			bind:addChannels={ruleCreateInput.channels!}
			bind:rewardValue={ruleCreateInput.rewardValue!}
			bind:rewardValueType={ruleCreateInput.rewardValueType!}
			bind:description={ruleCreateInput.description!}
			bind:catalogPredicate={ruleCreateInput.cataloguePredicate!}
		/>
	{/if}
</Modal>
