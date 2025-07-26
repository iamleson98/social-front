<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		ATTRIBUTE_VALUE_DELETE_MUTATION,
		ATTRIBUTE_VALUE_UPDATE_MUTATION,
		ATTRIBUTE_VALUES_QUERY,
		REORDER_ATTRIBUTE_VALUES_MUTATION,
	} from '$lib/api/admin/attribute';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		AttributeInputTypeEnum,
		type Query,
		type AttributeValue,
		type ReorderInput,
		type Mutation,
		type MutationAttributeReorderValuesArgs,
		type MutationAttributeValueDeleteArgs,
		type MutationAttributeValueUpdateArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { noop } from 'es-toolkit';
	import ColorPicker from 'svelte-awesome-color-picker';

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
	let loading = $state(false);

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
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'attributeValueDelete'>,
					MutationAttributeValueDeleteArgs
				>(ATTRIBUTE_VALUE_DELETE_MUTATION, {
					id: item.id,
				});

				loading = false;

				if (
					checkIfGraphqlResultHasError(
						result,
						'attributeValueDelete',
						$tranFunc('common.delSuccess'),
					)
				)
					return;

				forceReExecuteGraphqlQuery = true;
			},
		});
	};

	const handleUpdateValue = async (item: AttributeValue) => {};

	const handleArrangeValues = async (
		dragIndex: number,
		dragItem: AttributeValue,
		dropIndex: number,
		_dropItem: AttributeValue,
	) => {
		if (dragIndex === dropIndex) return;

		const steps = dropIndex - dragIndex;

		loading = true;

		const moves: ReorderInput[] = [{ id: dragItem.id, sortOrder: steps }];

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeReorderValues'>,
			MutationAttributeReorderValuesArgs
		>(REORDER_ATTRIBUTE_VALUES_MUTATION, {
			attributeId: attributeID!,
			moves,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'attributeReorderValues',
				$tranFunc('common.editSuccess'),
			)
		)
			return;

		forceReExecuteGraphqlQuery = true;
	};

	const handleUpdateAttributeValue = async () => {
		if (!valueItemToEdit) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeValueUpdate'>,
			MutationAttributeValueUpdateArgs
		>(ATTRIBUTE_VALUE_UPDATE_MUTATION, {
			id: valueItemToEdit.id,
			input: {
				name: valueItemToEdit.name,
				value: valueItemToEdit.value,
			},
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'attributeValueUpdate', $tranFunc('common.editSuccess'))
		)
			return;

		forceReExecuteGraphqlQuery = true;
		valueItemToEdit = undefined;
	};
</script>

{#snippet name({ item }: { item: AttributeValue })}
	<span>{item.name}</span>
{/snippet}

{#snippet value({ item }: { item: AttributeValue })}
	<div class="flex items-center gap-2">
		{#if item.inputType === AttributeInputTypeEnum.Swatch}
			<span class="w-5 h-5 rounded-lg" style="background-color: {item.value};"></span>
			<span style="color: {item.value};">{item.value}</span>
		{:else if item.inputType === AttributeInputTypeEnum.Dropdown}
			<span>{item.value || item.slug}</span>
		{:else if item.inputType === AttributeInputTypeEnum.Multiselect}
			<span>{item.value || item.slug}</span>
		{/if}
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
			data-interactive
			disabled={loading}
		/>
		<IconButton
			icon={Edit}
			size="xs"
			color="blue"
			variant="light"
			onclick={() => (valueItemToEdit = item)}
			data-interactive
			disabled={loading}
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
					disabled={loading}
					bind:forceReExecuteGraphqlQuery
					onDragEnd={handleArrangeValues}
					dragEffectType="move-position"
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
	disableElements={loading}
	onCancel={noop}
	onOk={handleUpdateAttributeValue}
	onClose={() => (valueItemToEdit = undefined)}
>
	{#if valueItemToEdit?.inputType === AttributeInputTypeEnum.Swatch}
		<ColorPicker bind:hex={valueItemToEdit.value} position="responsive" />
	{:else if valueItemToEdit?.inputType === AttributeInputTypeEnum.Dropdown}
		<Input label="Value" placeholder="Value" bind:value={valueItemToEdit.name} />
	{:else if valueItemToEdit?.inputType === AttributeInputTypeEnum.Multiselect}
		<Input label="Value" placeholder="Value" bind:value={valueItemToEdit.name} />
	{/if}
</Modal>
