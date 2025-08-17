<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { PencilMinus, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import { Table } from '$lib/components/ui/Table';
	import {
		RewardValueTypeEnum,
		type Category,
		type Collection,
		type Product,
		type ProductVariant,
		type PromotionRuleCreateInput,
	} from '$lib/gql/graphql';
	import { parseEditorJsString, SitenameCommonClassName } from '$lib/utils/utils';
	import {
		CATEGORY_COLUMNS,
		COLLECTION_COLUMNS,
		PRODUCT_COLUMNS,
		VARIANT_COLUMNS,
	} from '../vouchers/snippets.svelte';
	import type { TabKey } from './consts';
	import RuleEdit from './rule-edit.svelte';

	type Props = {
		rules: PromotionRuleCreateInput[];
		disabled?: boolean;
	};

	let { rules = $bindable(), disabled }: Props = $props();

	let selectedProducts = $state<Record<string, Product>>({});
	let selectedVariants = $state<Record<string, ProductVariant>>({});
	let selectedCategories = $state<Record<string, Category>>({});
	let selectedCollections = $state<Record<string, Collection>>({});

	let ruleActiveTabs = $state<TabKey[]>(new Array(rules.length).fill('products'));

	const handleDeleteRule = async (ruleIdx: number) => {
		rules = rules.filter((_, idx) => idx !== ruleIdx);
	};

	const handleClickEditRule = (idx: number) => {};

	const handleClickAddRule = () => {};

	const setActivePredicateTabOfRule = (ruleIdx: number, tabKey: TabKey) => {
		ruleActiveTabs[ruleIdx] = tabKey;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Rules</div>
		<Button endIcon={Plus} size="xs" variant="light" onclick={handleClickAddRule}>Add rule</Button>
	</SectionHeader>
</div>

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
						{disabled}
						onclick={() => handleClickEditRule(ruleIdx)}
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
</div>

<Modal
	open={!!ruleUpsertInput}
	header="Upsert promotion rule"
	okText={ruleUpsertInput?.id ? 'Update' : 'Create'}
	cancelText="Cancel"
	closeOnEscape
	closeOnOutsideClick
	disableElements={disabled}
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
