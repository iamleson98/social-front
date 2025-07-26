<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Search } from '$lib/components/icons';
	import { Checkbox, Input, Toggle } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Attribute, QueryAttributesArgs } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		hasVariants: boolean;
		disabled?: boolean;
		productAttributesToAssign: string[];
		variantAttributesToAssign: string[];
		formOk: boolean;
	};

	let {
		hasVariants = $bindable(),
		disabled,
		productAttributesToAssign = $bindable([]),
		variantAttributesToAssign = $bindable([]),
		formOk = $bindable(),
	}: Props = $props();

	let productAttrsVariables = $state<QueryAttributesArgs>({ first: 10, filter: { search: '' } });
	let forceFetchAvailableAttributes = $state(true);

	const AttributeColumns: TableColumnProps<Attribute>[] = [
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Slug',
			child: slug,
		},
		{
			title: 'Assign product',
			child: productAttrAssignSelect,
		},
		{
			title: 'Assign variant',
			child: variantAttrAssignSelect,
		},
	];

	$effect(() => {
		if (!hasVariants) variantAttributesToAssign = [];
		formOk = !!productAttributesToAssign.length;
	});
</script>

{#snippet productAttrAssignSelect({ item }: { item: Attribute })}
	{@const checked = productAttributesToAssign.includes(item.id)}
	<Toggle
		{checked}
		onCheckChange={(checked) =>
			checked
				? productAttributesToAssign.push(item.id)
				: (productAttributesToAssign = productAttributesToAssign.filter((id) => id !== item.id))}
		{disabled}
		label={checked ? 'Yes' : 'No'}
	/>
{/snippet}

{#snippet name({ item }: { item: Attribute })}
	<span>{item.name}</span>
{/snippet}

{#snippet slug({ item }: { item: Attribute })}
	<span>{item.slug}</span>
{/snippet}

{#snippet variantAttrAssignSelect({ item }: { item: Attribute })}
	{@const checked = variantAttributesToAssign.includes(item.id)}
	<Toggle
		{checked}
		onCheckChange={(checked) =>
			checked
				? variantAttributesToAssign.push(item.id)
				: (variantAttributesToAssign = variantAttributesToAssign.filter((id) => id !== item.id))}
		disabled={disabled || !hasVariants}
		label={checked ? 'Yes' : 'No'}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Attributes assign</div>
	</SectionHeader>
	<Checkbox label="Has Variant attributes" bind:checked={hasVariants} {disabled} />

	<Input
		startIcon={Search}
		placeholder="Search"
		bind:value={productAttrsVariables.filter!.search}
		inputDebounceOption={{
			debounceTime: 888,
			onInput: () => {
				forceFetchAvailableAttributes = true;
			},
		}}
	/>

	<GraphqlPaginableTable
		query={PRODUCT_ATTRIBUTES_QUERY}
		resultKey="attributes"
		columns={AttributeColumns}
		{disabled}
		bind:variables={productAttrsVariables}
		bind:forceReExecuteGraphqlQuery={forceFetchAvailableAttributes}
		autoRefetchOnVariableChange={false}
	/>
</div>
