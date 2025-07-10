<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY_STORE, PRODUCT_VARIANTS_QUERY_STORE } from '$lib/api';
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, Select } from '$lib/components/ui/select';
	import {
		type Channel,
		type PromotionRule,
		type QueryCategoriesArgs,
		type QueryCollectionsArgs,
		type QueryProductsArgs,
		type QueryProductVariantsArgs,
		RewardValueTypeEnum,
	} from '$lib/gql/graphql';
	import { classNames } from '$lib/utils/utils';
	import { number, object, string, z } from 'zod';

	// type Props = {
	// 	/** If not provided, meaning this is create modal */
	// 	rule?: PromotionRule;
	// };

	// let { rule }: Props = $props();

	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');
	const POSITIVE_ERROR = $tranFunc('error.negativeNumber');

	const RuleSchema = object({
		name: string().nonempty(FIELD_REQUIRED),
		channel: string().nonempty(FIELD_REQUIRED),
		rewardValue: number().nonnegative(POSITIVE_ERROR),
		rewardValueType: z.enum([RewardValueTypeEnum.Fixed, RewardValueTypeEnum.Percentage]),
	});

	type RuleType = z.infer<typeof RuleSchema>;

	let ruleFormErrors = $state.raw<Partial<Record<keyof RuleType, string[]>>>({});

	let rule = $state<RuleType>({
		name: '',
		channel: '',
		rewardValue: 0,
		rewardValueType: RewardValueTypeEnum.Fixed,
	});
	let selectedChannel = $state<Channel>();

	const validate = () => {
		const result = RuleSchema.safeParse(rule);
		ruleFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const RuleConditions = $state([
		{
			title: 'products',
			selected: false,
			values: [],
			component: products,
		},
		{
			title: 'collections',
			selected: false,
			values: [],
			component: collections,
		},
		{
			title: 'variants',
			selected: false,
			values: [],
			component: variants,
		},
		{
			title: 'categories',
			selected: false,
			values: [],
			component: categories,
		},
	]);
</script>

{#snippet products()}
	{#if rule.channel}
		<GraphqlPaginableSelect
			query={PRODUCT_LIST_QUERY_STORE}
			variables={{ first: 20, channel: rule.channel, filter: { search: '' } } as QueryProductsArgs}
			optionLabelKey="name"
			optionValueKey="id"
			variableSearchQueryPath="filter.search"
			multiple
			bind:value={RuleConditions[0].values}
			resultKey="products"
			size="sm"
		/>
	{/if}
{/snippet}

{#snippet collections()}
	{#if rule.channel}
		<GraphqlPaginableSelect
			query={COLLECTIONS_QUERY}
			variables={{
				first: 20,
				channel: rule.channel,
				filter: { search: '' },
			} as QueryCollectionsArgs}
			optionLabelKey="name"
			optionValueKey="id"
			variableSearchQueryPath="filter.search"
			multiple
			bind:value={RuleConditions[1].values}
			resultKey="collections"
			size="sm"
		/>
	{/if}
{/snippet}

{#snippet categories()}
	<GraphqlPaginableSelect
		query={CATEGORIES_LIST_QUERY}
		variables={{ first: 20, filter: { search: '' } } as QueryCategoriesArgs}
		optionLabelKey="name"
		optionValueKey="id"
		variableSearchQueryPath="filter.search"
		multiple
		bind:value={RuleConditions[3].values}
		resultKey="categories"
		size="sm"
	/>
{/snippet}

{#snippet variants()}
	{#if rule.channel}
		<GraphqlPaginableSelect
			query={PRODUCT_VARIANTS_QUERY_STORE}
			variables={{
				first: 20,
				filter: { search: '' },
				channel: rule.channel,
			} as QueryProductVariantsArgs}
			optionLabelKey="name"
			optionValueKey="id"
			variableSearchQueryPath="filter.search"
			multiple
			bind:value={RuleConditions[2].values}
			resultKey="productVariants"
			size="sm"
		/>
	{/if}
{/snippet}

<div class="space-y-3">
	<div class="flex items-start gap-2">
		<Input
			label="Rule name"
			placeholder="Name"
			class="flex-1"
			bind:value={rule.name}
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={ruleFormErrors.name?.length ? 'error' : 'info'}
			subText={ruleFormErrors.name?.[0]}
			required
		/>
		<ChannelSelect
			label="Application channel"
			bind:value={rule.channel}
			variant={ruleFormErrors.channel?.length ? 'error' : 'info'}
			subText={ruleFormErrors.channel?.[0]}
			onchange={(chan) => {
				selectedChannel = chan;
				validate();
			}}
			required
			class="flex-1"
		/>
	</div>

	{#if rule.channel}
		<div class="text-sm">
			<dir class="font-medium text-gray-700">Conditions</dir>
			<!-- <Button size="xs" endIcon={Plus}>Add condition</Button> -->
			<div class="space-y-2">
				{#each RuleConditions as cond, idx (idx)}
					<div class="flex items-center gap-1">
						<div class="flex-1/4">
							<Checkbox label={cond.title} size="sm" bind:checked={cond.selected} />
						</div>
						<div class="flex-3/4">
							{#if cond.selected}
								{@render cond.component()}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex items-start gap-2">
		<div class="text-sm">
			<div class="font-medium text-gray-800 mb-1">Reward type</div>
			<div class="tabs tabs-box p-0!">
				{#each Object.values(RewardValueTypeEnum) as value, idx (idx)}
					<input
						type="radio"
						class={classNames('tab shadow-none! rounded-lg!', {
							'ring! ring-gray-400!': rule.rewardValueType === value,
						})}
						{value}
						aria-label={value.toLowerCase()}
						bind:group={rule.rewardValueType}
					/>
				{/each}
			</div>
		</div>

		<Input
			label="Reward value"
			placeholder="Reward value"
			class="flex-2/3"
			bind:value={rule.rewardValue}
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={ruleFormErrors.rewardValue?.length ? 'error' : 'info'}
			subText={ruleFormErrors.rewardValue?.[0]}
			required
			type="number"
			min={0}
		>
			{#snippet action()}
				<span class="text-xs font-semibold">
					{rule.rewardValueType === RewardValueTypeEnum.Fixed ? selectedChannel?.currencyCode : '%'}
				</span>
			{/snippet}
		</Input>
	</div>

	<EditorJSComponent label="Description" placeholder="Description" />
</div>
