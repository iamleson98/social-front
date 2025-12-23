<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Search } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input, Toggle } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableCellProps,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import type { Attribute, QueryAttributesArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { canUseAttributeForVariantSelection, MaximumVariantSelectionAttributes } from './utils';

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
			child: { render: ({ item }) => item.slug },
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

{#snippet name({ item }: TableCellProps<Attribute>)}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(item.id)}>{item.name}</a>
{/snippet}

{#snippet productAttrAssignSelect({ item }: TableCellProps<Attribute>)}
	{@const alreadyChecked = productAttributesToAssign.includes(item.id)}
	<Checkbox
		checked={alreadyChecked}
		onCheckChange={(checked) =>
			checked
				? productAttributesToAssign.push(item.id)
				: (productAttributesToAssign = productAttributesToAssign.filter((id) => id !== item.id))}
		{disabled}
		label={alreadyChecked ? $T('common.yes') : $T('common.no')}
	/>
{/snippet}

{#snippet variantAttrAssignSelect({ item }: TableCellProps<Attribute>)}
	{@const checked = variantAttributesToAssign.includes(item.id)}
	{@const isVariantSelectable = canUseAttributeForVariantSelection(item)}
	{@const disable =
		!hasVariants ||
		!isVariantSelectable ||
		disabled ||
		(variantAttributesToAssign.length === MaximumVariantSelectionAttributes && !checked)}
	<Checkbox
		{checked}
		onCheckChange={(checked) =>
			checked
				? variantAttributesToAssign.push(item.id)
				: (variantAttributesToAssign = variantAttributesToAssign.filter((id) => id !== item.id))}
		disabled={disable}
		label={checked ? $T('common.yes') : $T('common.no')}
		subText={!isVariantSelectable
			? $T('attribute.attrCanNotBeVariantSelection', { inputType: item.inputType })
			: undefined}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$T('attribute.assignAttr')}</div>
	</SectionHeader>
	<Checkbox label={$T('prdType.hasVariantAttrs')} bind:checked={hasVariants} {disabled} />
	<Input
		startIcon={Search}
		placeholder={$T('common.search')}
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
		autoRefetchOnPaginationParamsChange
		autoFetchDataOnMount
	/>
	<Alert size="sm">
		{$T('prdType.canChooseAtMost2VariantAttrsAlert')}
	</Alert>
</div>
