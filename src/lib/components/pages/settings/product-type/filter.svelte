<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		FilterManager,
		type FilterComponentType,
		type FilterProps,
	} from '$lib/components/common/filter-box';
	import { Checkbox } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		ProductTypeEnum,
		type ProductTypeFilterInput,
		type QueryProductTypesArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryProductTypesArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable() }: Props = $props();

	const Filters: FilterProps<ProductTypeFilterInput>[] = [
		{
			label: $tranFunc('prdType.hasVariantAttrs'),
			key: 'configurable',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: $tranFunc('prdType.type'),
			key: 'productType',
			operations: [
				{
					operator: 'eq',
					component: prdType,
				},
			],
		},
	];

	const ProductTypeTypeOptions = [
		ProductTypeEnum.Digital,
		ProductTypeEnum.Shippable,
	].map<SelectOption>((item) => ({
		label: item.toLowerCase(),
		value: item,
	}));
</script>

{#snippet yesNo({ initialValue = false, onValue }: FilterComponentType)}
	<Checkbox
		size="sm"
		label="yes"
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

{#snippet prdType({ initialValue, onValue }: FilterComponentType)}
	<Select
		size="xs"
		options={ProductTypeTypeOptions}
		placeholder="type"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

<FilterManager
	bind:variables
	bind:forceReExecuteGraphqlQuery
	filterOptions={Filters}
	searchKey={'filter.search' as keyof QueryProductTypesArgs}
/>
