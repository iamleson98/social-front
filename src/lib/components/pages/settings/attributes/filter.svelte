<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		FilterManager,
		type FilterComponentType,
		type FilterProps,
	} from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeTypeEnum,
		type AttributeFilterInput,
		type QueryAttributesArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryAttributesArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const FilterOptions: FilterProps<AttributeFilterInput> = {
		filterableInStorefront: {
			label: $tranFunc('attributes.filterableInStore'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		isVariantOnly: {
			label: $tranFunc('attributes.variantOnly'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		valueRequired: {
			label: $tranFunc('attributes.valRequired'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		visibleInStorefront: {
			label: $tranFunc('attributes.visibleInStore'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		type: {
			label: $tranFunc('prdType.type'),
			operations: {
				eq: type,
			},
		},
		channel: {
			label: $tranFunc('product.channel'),
			operations: {
				eq: CommonSnippets.singleChannelSlug,
			},
		},
	};

	const TypeOptions = Object.values(AttributeTypeEnum).map((value) => ({
		label: $tranFunc(`attributes.${value}`),
		value,
	}));
</script>

{#snippet type({ onValue, initialValue }: FilterComponentType)}
	<Select
		size="xs"
		options={TypeOptions}
		placeholder={$tranFunc('prdType.type')}
		value={initialValue as string}
		onchange={(value) => onValue((value as SelectOption).value)}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey={'filter.search' as keyof QueryAttributesArgs}
	variablePatchingCallbackAfterReload={(vars, params) => {
		const {
			filterableInStorefront,
			isVariantOnly,
			valueRequired,
			visibleInStorefront,
			type,
			channel,
		} = params;

		if (!vars.filter) vars.filter = {};

		if (filterableInStorefront)
			vars.filter.filterableInStorefront = filterableInStorefront.value as boolean;
		if (isVariantOnly) vars.filter.isVariantOnly = isVariantOnly.value as boolean;
		if (valueRequired) vars.filter.valueRequired = valueRequired.value as boolean;
		if (visibleInStorefront)
			vars.filter.visibleInStorefront = visibleInStorefront.value as boolean;
		if (type) vars.filter.type = type.value as AttributeTypeEnum;
		if (channel) vars.channel = channel.value as string;

		return vars;
	}}
/>
