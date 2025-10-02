<script lang="ts">
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
			label: 'Filterable in storefront',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		isVariantOnly: {
			label: 'Variant only',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		valueRequired: {
			label: 'Is required',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		visibleInStorefront: {
			label: 'Visible in storefront',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		type: {
			label: 'Type',
			operations: {
				eq: type,
			},
		},
		channel: {
			label: 'Channel',
			operations: {
				eq: CommonSnippets.singleChannelSlug,
			},
		},
	};

	const TypeOptions = Object.values(AttributeTypeEnum).map((value) => ({
		label: value.toLowerCase().replace('_', ' '),
		value: value,
	}));
</script>

{#snippet type({ onValue, initialValue }: FilterComponentType)}
	<Select
		size="xs"
		options={TypeOptions}
		placeholder="Type"
		value={initialValue as string}
		onchange={(value) => onValue((value as SelectOption).value)}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey={'filter.search' as keyof QueryAttributesArgs}
	variablePatchingCallbackAfterReload={(variables, params) => {
		const {
			filterableInStorefront,
			isVariantOnly,
			valueRequired,
			visibleInStorefront,
			type,
			channel,
		} = params;

		if (!variables.filter) variables.filter = {};

		if (filterableInStorefront)
			variables.filter.filterableInStorefront = filterableInStorefront.value as boolean;
		if (isVariantOnly) variables.filter.isVariantOnly = isVariantOnly.value as boolean;
		if (valueRequired) variables.filter.valueRequired = valueRequired.value as boolean;
		if (visibleInStorefront)
			variables.filter.visibleInStorefront = visibleInStorefront.value as boolean;
		if (type) variables.filter.type = type.value as AttributeTypeEnum;
		if (channel) variables.channel = channel.value as string;

		return variables;
	}}
/>
