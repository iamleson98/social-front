<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY, PRODUCT_VARIANTS_QUERY } from '$lib/api';
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import {
		type Channel,
		type QueryCategoriesArgs,
		type QueryCollectionsArgs,
		type QueryProductsArgs,
		type QueryProductVariantsArgs,
		RewardValueTypeEnum,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { classNames } from '$lib/utils/utils';
	import type { OutputData } from '@editorjs/editorjs';
	import { number, object, string, z } from 'zod';

	type Props = {
		existingChannelId?: string;
		name: string;
		addChannels: string[];
		removeChannels?: string[];
		rewardValue: number;
		rewardValueType: RewardValueTypeEnum;
		description: OutputData;
	};

	let {
		name = $bindable(),
		addChannels = $bindable(),
		removeChannels = $bindable(),
		rewardValue = $bindable(),
		rewardValueType = $bindable(),
		existingChannelId,
		description = $bindable(),
	}: Props = $props();

	const POSITIVE_ERROR = $tranFunc('error.negativeNumber');

	const RuleSchema = object({
		name: string().nonempty(CommonState.FieldRequiredError),
		addChannels: string().nonempty(CommonState.FieldRequiredError),
		removeChannels: string(),
		rewardValue: number().nonnegative(POSITIVE_ERROR),
		rewardValueType: z.enum([RewardValueTypeEnum.Fixed, RewardValueTypeEnum.Percentage]),
	});

	type RuleType = z.infer<typeof RuleSchema>;

	let ruleFormErrors = $state.raw<Partial<Record<keyof RuleType, string[]>>>({});

	let selectedChannel = $state<Channel>();
	let selectedChannelId = $state(existingChannelId);

	const validate = () => {
		const result = RuleSchema.safeParse({
			name,
			addChannels,
			removeChannels,
			rewardValue,
			rewardValueType,
		});
		ruleFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	let useProductsWithPromotion = $state(false);
	let useProductVariantsWithPromotion = $state(false);
	let useCategoriesWithPromotion = $state(false);
	let useCollectionsWithPromotion = $state(false);

	let performProductsFetching = $state(false);
	let performProductVariantsFetching = $state(false);
	let performCategoriesFetching = $state(false);
	let performCollectionsFetching = $state(false);

	let productIds = $state<string[]>([]);
	let productVariantIds = $state<string[]>([]);
	let categoryIds = $state<string[]>([]);
	let collectionIds = $state<string[]>([]);

	let productsVariable = $state<QueryProductsArgs>({
		first: 20,
		channel: selectedChannel?.slug,
		filter: { search: '' },
	});

	let productVariantsVariable = $state<QueryProductVariantsArgs>({
		first: 20,
		channel: selectedChannel?.slug,
		filter: { search: '' },
	});

	let categoriesVariable = $state<QueryCategoriesArgs>({
		first: 20,
		filter: { search: '' },
	});

	let collectionsVariable = $state<QueryCollectionsArgs>({
		first: 20,
		filter: { search: '' },
		channel: selectedChannel?.slug,
	});

	const updateChannelsForVariables = (chan: Channel) => {
		productsVariable = { ...productsVariable, channel: chan.slug };
		performProductsFetching = useProductsWithPromotion;

		productVariantsVariable = { ...productVariantsVariable, channel: chan.slug };
		performProductVariantsFetching = useProductVariantsWithPromotion;

		collectionsVariable = { ...collectionsVariable, channel: chan.slug };
		performCollectionsFetching = useCollectionsWithPromotion;
	};

	const handleChannelChange = (chan: Channel | Channel[] | undefined) => {
		if (chan) {
			const newChan = chan as Channel;
			updateChannelsForVariables(newChan);
			if (existingChannelId && newChan.id !== existingChannelId) {
				addChannels = [newChan.id];
				removeChannels = [existingChannelId];
			}
		}

		validate();
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
		/>
		<ChannelSelect
			label="Application channel"
			bind:value={selectedChannelId}
			variant={ruleFormErrors.addChannels?.length ? 'error' : 'info'}
			subText={ruleFormErrors.addChannels?.[0]}
			onchange={handleChannelChange}
			required
			class="flex-1"
			onblur={validate}
		/>
	</div>

	{#if selectedChannelId}
		<div class="text-sm space-y-2">
			<dir class="font-medium text-gray-700">Conditions</dir>
			<div class="space-y-2">
				<div class="flex items-center gap-1">
					<Checkbox
						label="Products"
						bind:checked={useProductsWithPromotion}
						onCheckChange={(checked) => (performProductsFetching = checked)}
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
						bind:value={productIds}
					/>
				</div>

				<div class="flex items-center gap-1">
					<Checkbox
						label="Product variants"
						bind:checked={useProductVariantsWithPromotion}
						onCheckChange={(checked) => (performProductVariantsFetching = checked)}
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
						bind:value={productVariantIds}
					/>
				</div>

				<div class="flex items-center gap-1">
					<Checkbox
						label="Categories"
						bind:checked={useCategoriesWithPromotion}
						onCheckChange={(checked) => (performCategoriesFetching = checked)}
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
						bind:value={categoryIds}
					/>
				</div>

				<div class="flex items-center gap-1">
					<Checkbox
						label="Collections"
						bind:checked={useCollectionsWithPromotion}
						onCheckChange={(checked) => (performCollectionsFetching = checked)}
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
						bind:value={collectionIds}
					/>
				</div>
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
							'ring! ring-gray-400!': rewardValueType === value,
						})}
						{value}
						aria-label={value.toLowerCase()}
						bind:group={rewardValueType}
					/>
				{/each}
			</div>
		</div>

		<Input
			label="Reward value"
			placeholder="Reward value"
			class="flex-2/3"
			bind:value={rewardValue}
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
					{rewardValueType === RewardValueTypeEnum.Fixed ? selectedChannel?.currencyCode : '%'}
				</span>
			{/snippet}
		</Input>
	</div>

	<EditorJSComponent label="Description" placeholder="Description" />
</div>
