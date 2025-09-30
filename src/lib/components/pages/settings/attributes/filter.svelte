<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import {
		FilterManager,
		type FilterComponentType,
		type FilterItemValue,
		type FilterProps,
	} from '$lib/components/common/filter-box';
	import { Checkbox } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeTypeEnum,
		type AttributeFilterInput,
		type Channel,
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
				eq: yesNo,
			},
		},
		isVariantOnly: {
			label: 'Variant only',
			operations: {
				eq: yesNo,
			},
		},
		valueRequired: {
			label: 'Is required',
			operations: {
				eq: yesNo,
			},
		},
		visibleInStorefront: {
			label: 'Visible in storefront',
			operations: {
				eq: yesNo,
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
				eq: channel,
			},
		},
	};

	const TypeOptions = Object.values(AttributeTypeEnum).map((value) => ({
		label: value.toLowerCase().replace('_', ' '),
		value: value,
	}));
</script>

{#snippet yesNo({ onValue, initialValue }: FilterComponentType)}
	<Checkbox
		size="sm"
		label="Yes?"
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

{#snippet type({ onValue, initialValue }: FilterComponentType)}
	<Select
		size="xs"
		options={TypeOptions}
		placeholder="Type"
		value={initialValue as string}
		onchange={(value) => onValue((value as SelectOption).value)}
	/>
{/snippet}

{#snippet channel({ onValue, initialValue }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		placeholder="Channel"
		valueType="slug"
		value={initialValue}
		onchange={(value) => onValue((value as Channel)?.slug as FilterItemValue)}
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

		if (filterableInStorefront) variables.filter.filterableInStorefront = filterableInStorefront.value as boolean;
		if (isVariantOnly) variables.filter.isVariantOnly = isVariantOnly.value as boolean;
		if (valueRequired) variables.filter.valueRequired = valueRequired.value as boolean;
		if (visibleInStorefront) variables.filter.visibleInStorefront = visibleInStorefront.value as boolean;
		if (type) variables.filter.type = type.value as AttributeTypeEnum;
		if (channel) variables.channel = channel.value as string;

		return variables;
	}}
/>
