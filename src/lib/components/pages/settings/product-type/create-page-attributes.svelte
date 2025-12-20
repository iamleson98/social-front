<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Search } from '$lib/components/icons';
	import { Checkbox, Input, Toggle } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import type { Attribute, QueryAttributesArgs } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { canUseAttributeForVariantSelection } from './utils';

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
	let tableRef = $state<GraphqlPaginableTableInterface>();

	const AttributeColumns: TableColumnProps<Attribute>[] = $derived([
		{
			title: $T('common.name'),
			child: name,
		},
		{
			title: $T('common.slug'),
			child: slug,
		},
		{
			title: $T('collection.assignPrd'),
			child: productAttrAssignSelect,
		},
		{
			title: $T('collection.assignVariant'),
			child: variantAttrAssignSelect,
		},
	]);

	$effect(() => {
		if (!hasVariants) variantAttributesToAssign = [];
		formOk = !!productAttributesToAssign.length;
	});
</script>

{#snippet productAttrAssignSelect({ item }: { item: Attribute })}
	{@const alreadyChecked = productAttributesToAssign.includes(item.id)}
	<Toggle
		checked={alreadyChecked}
		onCheckChange={(checked) =>
			checked
				? productAttributesToAssign.push(item.id)
				: (productAttributesToAssign = productAttributesToAssign.filter((id) => id !== item.id))}
		{disabled}
		label={alreadyChecked ? 'Yes' : 'No'}
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
	{@const isNotVariantSelectable = !canUseAttributeForVariantSelection(item)}
	<Toggle
		{checked}
		onCheckChange={(checked) =>
			checked
				? variantAttributesToAssign.push(item.id)
				: (variantAttributesToAssign = variantAttributesToAssign.filter((id) => id !== item.id))}
		disabled={disabled || !hasVariants || !isNotVariantSelectable}
		label={checked ? 'Yes' : 'No'}
		class={[isNotVariantSelectable && 'tooltip tooltip-top']}
		data-tip={isNotVariantSelectable
			? `Attribute "${item.inputType}" can not be used as variant selection`
			: undefined}
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
			onInput: () => tableRef?.triggerFetchData(),
		}}
	/>

	<GraphqlPaginableTable
		query={PRODUCT_ATTRIBUTES_QUERY}
		resultKey="attributes"
		columns={AttributeColumns}
		{disabled}
		bind:this={tableRef}
		bind:variables={productAttrsVariables}
		autoRefetchOnPaginationParamsChange={false}
	/>
</div>
