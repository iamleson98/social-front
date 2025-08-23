<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY, PRODUCT_VARIANTS_QUERY } from '$lib/api';
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import {
		type CataloguePredicateInput,
		type Channel,
		type QueryCategoriesArgs,
		type QueryCollectionsArgs,
		type QueryProductsArgs,
		type QueryProductVariantsArgs,
		RewardValueTypeEnum,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import { array, number, object, string, z } from 'zod';

	type Props = {
		name: string;
		addChannels: string[];
		rewardValue: number;
		rewardValueType: RewardValueTypeEnum;
		description: OutputData;
		catalogPredicate: CataloguePredicateInput;
		disabled?: boolean;
	};

	let {
		name = $bindable(),
		addChannels = $bindable([]),
		rewardValue = $bindable(),
		rewardValueType = $bindable(),
		description = $bindable(),
		catalogPredicate = $bindable(),
		disabled,
	}: Props = $props();

	const POSITIVE_ERROR = $tranFunc('error.negativeNumber');

	const RuleSchema = object({
		name: string().nonempty(CommonState.FieldRequiredError),
		addChannels: array(string()).nonempty(CommonState.FieldRequiredError),
		rewardValue: number().nonnegative(POSITIVE_ERROR),
		rewardValueType: z.enum([RewardValueTypeEnum.Fixed, RewardValueTypeEnum.Percentage]),
	});

	type RuleType = z.infer<typeof RuleSchema>;

	let ruleFormErrors = $state.raw<Partial<Record<keyof RuleType, string[]>>>({});
	let selectedChannel = $state<Channel>();

	const validate = () => {
		const result = RuleSchema.safeParse({
			name,
			addChannels,
			rewardValue,
			rewardValueType,
		});
		ruleFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	let useProductsWithPromotion = $state(!!catalogPredicate?.productPredicate?.ids?.length);
	let useProductVariantsWithPromotion = $state(!!catalogPredicate?.variantPredicate?.ids?.length);
	let useCategoriesWithPromotion = $state(!!catalogPredicate?.categoryPredicate?.ids?.length);
	let useCollectionsWithPromotion = $state(!!catalogPredicate?.collectionPredicate?.ids?.length);

	let performProductsFetching = $state(!!catalogPredicate?.productPredicate?.ids?.length);
	let performProductVariantsFetching = $state(!!catalogPredicate?.variantPredicate?.ids?.length);
	let performCategoriesFetching = $state(!!catalogPredicate?.categoryPredicate?.ids?.length);
	let performCollectionsFetching = $state(!!catalogPredicate?.collectionPredicate?.ids?.length);

	let productsVariable = $state<QueryProductsArgs>({
		first: 20,
		channel: undefined,
		filter: { search: '' },
	});
	let productVariantsVariable = $state<QueryProductVariantsArgs>({
		first: 20,
		channel: undefined,
		filter: { search: '' },
	});
	let categoriesVariable = $state<QueryCategoriesArgs>({
		first: 20,
		filter: { search: '' },
	});
	let collectionsVariable = $state<QueryCollectionsArgs>({
		first: 20,
		filter: { search: '' },
		channel: undefined,
	});

	const updateChannelsForVariables = (chan: Channel) => {
		productsVariable = { ...productsVariable, channel: chan.slug };
		performProductsFetching = useProductsWithPromotion;

		productVariantsVariable = { ...productVariantsVariable, channel: chan.slug };
		performProductVariantsFetching = useProductVariantsWithPromotion;

		collectionsVariable = { ...collectionsVariable, channel: chan.slug };
		performCollectionsFetching = useCollectionsWithPromotion;
	};
</script>

<div class="space-y-3">
	<div class="flex items-start gap-2">
		<Input
			label="Rule name"
			placeholder="Name"
			class="flex-1"
			bind:value={name}
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={ruleFormErrors.name?.length ? 'error' : 'info'}
			subText={ruleFormErrors.name?.[0]}
			required
			{disabled}
		/>
		<ChannelSelect
			label="Application channel"
			bind:value={addChannels[0]}
			variant={ruleFormErrors.addChannels?.length ? 'error' : 'info'}
			subText={ruleFormErrors.addChannels?.[0]}
			required
			{disabled}
			valueType="id"
			class="flex-1"
			onblur={validate}
			onchange={(value) => {
				if (value) updateChannelsForVariables(value as Channel);
				selectedChannel = value as Channel;
				validate();
			}}
		/>
	</div>

	{#if addChannels.length}
		<div class="text-sm space-y-2">
			<dir class="font-medium text-gray-700">Conditions</dir>
			<div class="space-y-2">
				<div class="flex items-center gap-1">
					<Checkbox
						{disabled}
						label="Products"
						bind:checked={useProductsWithPromotion}
						onCheckChange={(checked) => {
							performProductsFetching = checked; // if checked, we perform fetching product list
							if (!checked) catalogPredicate.productPredicate!.ids = []; // if not, we must reset selected products
						}}
						class="flex-1/4"
					/>
					<GraphqlPaginableSelect
						class="flex-3/4"
						query={PRODUCT_LIST_QUERY}
						bind:variables={productsVariable}
						optionLabelKey="name"
						optionValueKey="id"
						variableSearchQueryPath="filter.search"
						multiple
						resultKey="products"
						size="sm"
						bind:performDataFetching={performProductsFetching}
						disabled={!useProductsWithPromotion || disabled}
						bind:value={catalogPredicate.productPredicate!.ids}
					/>
				</div>

				<div class="flex items-center gap-1">
					<Checkbox
						label="Product variants"
						bind:checked={useProductVariantsWithPromotion}
						onCheckChange={(checked) => {
							performProductVariantsFetching = checked;
							if (!checked) catalogPredicate.variantPredicate!.ids = [];
						}}
						{disabled}
						class="flex-1/4"
					/>
					<GraphqlPaginableSelect
						class="flex-3/4"
						query={PRODUCT_VARIANTS_QUERY}
						bind:variables={productVariantsVariable}
						optionLabelKey="name"
						optionValueKey="id"
						variableSearchQueryPath="filter.search"
						multiple
						resultKey="productVariants"
						size="sm"
						bind:performDataFetching={performProductVariantsFetching}
						disabled={!useProductVariantsWithPromotion || disabled}
						bind:value={catalogPredicate.variantPredicate!.ids}
					/>
				</div>

				<div class="flex items-center gap-1">
					<Checkbox
						label="Categories"
						bind:checked={useCategoriesWithPromotion}
						onCheckChange={(checked) => {
							performCategoriesFetching = checked;
							if (!checked) catalogPredicate.categoryPredicate!.ids = [];
						}}
						{disabled}
						class="flex-1/4"
					/>
					<GraphqlPaginableSelect
						class="flex-3/4"
						query={CATEGORIES_LIST_QUERY}
						bind:variables={categoriesVariable}
						optionLabelKey="name"
						optionValueKey="id"
						variableSearchQueryPath="filter.search"
						multiple
						resultKey="categories"
						size="sm"
						bind:performDataFetching={performCategoriesFetching}
						disabled={!useCategoriesWithPromotion || disabled}
						bind:value={catalogPredicate.categoryPredicate!.ids}
					/>
				</div>

				<div class="flex items-center gap-1">
					<Checkbox
						label="Collections"
						bind:checked={useCollectionsWithPromotion}
						onCheckChange={(checked) => {
							performCollectionsFetching = checked;
							if (!checked) catalogPredicate.collectionPredicate!.ids = [];
						}}
						{disabled}
						class="flex-1/4"
					/>
					<GraphqlPaginableSelect
						class="flex-3/4"
						query={COLLECTIONS_QUERY}
						bind:variables={collectionsVariable}
						optionLabelKey="name"
						optionValueKey="id"
						variableSearchQueryPath="filter.search"
						multiple
						resultKey="collections"
						size="sm"
						bind:performDataFetching={performCollectionsFetching}
						disabled={!useCollectionsWithPromotion || disabled}
						bind:value={catalogPredicate.collectionPredicate!.ids}
					/>
				</div>
			</div>
		</div>
	{/if}

	<div class="flex items-start gap-2">
		<div class="text-sm flex-1/4">
			<div class="font-medium text-gray-800 mb-1">Reward type</div>
			<div class="space-y-1">
				{#each Object.values(RewardValueTypeEnum) as value, idx (idx)}
					<RadioButton
						{value}
						bind:group={rewardValueType}
						{disabled}
						label={value.toLowerCase()}
						size="sm"
					/>
				{/each}
			</div>
		</div>

		<Input
			label="Reward value"
			placeholder="Reward value"
			class="flex-3/4"
			bind:value={rewardValue}
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={ruleFormErrors.rewardValue?.length ? 'error' : 'info'}
			subText={ruleFormErrors.rewardValue?.[0]}
			required
			{disabled}
			type="number"
			min={0}
		>
			{#snippet action()}
				<span class="text-xs font-semibold">
					{rewardValueType === RewardValueTypeEnum.Fixed ? selectedChannel?.currencyCode : '%'}
				</span>
			{/snippet}
		</Input>
	</div>

	<EditorJSComponent
		{disabled}
		label="Description"
		placeholder="Description"
		bind:value={description}
	/>
</div>
