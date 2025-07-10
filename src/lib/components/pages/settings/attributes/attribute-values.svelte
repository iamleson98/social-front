<script lang="ts">
	import { ATTRIBUTE_VALUES_QUERY } from '$lib/api/admin/attribute';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { ColorPicker } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { AttributeInputTypeEnum, type Query, type AttributeValue } from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { noop } from 'es-toolkit';

	type Props = {
		inputType: AttributeInputTypeEnum;
		withChoices?: boolean;
		/** if not provided, meaning it is create page */
		attributeID?: string;
		attributeName?: string;
	};

	let { inputType, attributeID, attributeName }: Props = $props();

	let showValues = $derived(
		[
			AttributeInputTypeEnum.Dropdown,
			AttributeInputTypeEnum.Numeric,
			AttributeInputTypeEnum.Multiselect,
			AttributeInputTypeEnum.Swatch,
		].includes(inputType),
	);

	let variables = $state({
		id: attributeID,
		first: 20,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(true);
	let valueItemToEdit = $state<AttributeValue>();

	const ValueColumns: TableColumnProps<AttributeValue>[] = [
		{
			title: 'name',
			child: name,
		},
		{
			title: 'value',
			child: value,
		},
		{
			title: 'action',
			child: action,
		},
	];

	const handleDeleteValue = async (item: AttributeValue) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure you want to delete "${item.name}" value? If you delete it you won't be able to assign it to any of the products with "${attributeName ?? '-'}" attribute.`,
			onOk: async () => {},
		});
	};

	const handleUpdateValue = async (item: AttributeValue) => {};
</script>

{#snippet name({ item }: { item: AttributeValue })}
	<span>{item.name}</span>
{/snippet}

{#snippet value({ item }: { item: AttributeValue })}
	<div class="flex items-center gap-2">
		{#if item.inputType === AttributeInputTypeEnum.Swatch}
			<span class="w-5 h-5 rounded-lg" style="background-color: {item.value};"></span>
		{/if}
		<span style="color: {item.value};">{item.value}</span>
	</div>
{/snippet}

{#snippet action({ item }: { item: AttributeValue })}
	<div class="flex gap-1">
		<IconButton
			icon={Trash}
			size="xs"
			color="red"
			variant="light"
			onclick={() => handleDeleteValue(item)}
		/>
		<IconButton
			icon={Edit}
			size="xs"
			color="blue"
			variant="light"
			onclick={() => (valueItemToEdit = item)}
		/>
	</div>
{/snippet}

{#if showValues}
	<div class="p-3 rounded-lg border border-gray-200 bg-white">
		{#if inputType !== AttributeInputTypeEnum.Numeric}
			<SectionHeader>Attribute values</SectionHeader>

			<!-- is this is edit page -->
			{#if attributeID}
				<GraphqlPaginableTable
					query={ATTRIBUTE_VALUES_QUERY}
					resultKey={'attribute.choices' as keyof Query}
					columns={ValueColumns}
					bind:variables
					bind:forceReExecuteGraphqlQuery
				/>
			{/if}
		{:else}
			<div></div>
		{/if}
	</div>
{/if}

<Modal
	size="sm"
	open={!!valueItemToEdit}
	header="Edit attribute"
	closeOnEscape
	closeOnOutsideClick
	onCancel={noop}
	onOk={noop}
>
	{#if valueItemToEdit?.inputType === AttributeInputTypeEnum.Swatch}
		<ColorPicker />
	{/if}
</Modal>
