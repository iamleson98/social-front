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
		type QueryAttributesArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryAttributesArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const FILTER_OPTIONS: FilterProps<AttributeFilterInput>[] = [
		{
			label: 'Filterable in storefront',
			key: 'filterableInStorefront',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Variant only',
			key: 'isVariantOnly',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Is required',
			key: 'valueRequired',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Visible in storefront',
			key: 'visibleInStorefront',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Type',
			key: 'type',
			operations: [
				{
					operator: 'eq',
					component: type,
				},
			],
		},
		{
			label: 'Channel',
			key: 'channel',
			operations: [
				{
					operator: 'eq',
					component: channel,
				},
			],
		},
	];

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
		value={initialValue}
		onchange={(value) => onValue(value?.id as FilterItemValue)}
	/>
{/snippet}

<FilterManager
	filterOptions={FILTER_OPTIONS}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey={'filter.search' as keyof QueryAttributesArgs}
/>
