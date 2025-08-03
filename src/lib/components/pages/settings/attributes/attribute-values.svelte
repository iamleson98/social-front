<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		ATTRIBUTE_VALUE_CREATE_MUTATION,
		ATTRIBUTE_VALUE_DELETE_MUTATION,
		ATTRIBUTE_VALUE_UPDATE_MUTATION,
		ATTRIBUTE_VALUES_QUERY,
		REORDER_ATTRIBUTE_VALUES_MUTATION,
	} from '$lib/api/admin/attribute';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Input } from '$lib/components/ui/Input';
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
		type AttributeValueUpdateInput,
		type MutationAttributeValueCreateArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { noop } from 'es-toolkit';
	import ColorPicker from 'svelte-awesome-color-picker';

	type Props = {
		inputType: AttributeInputTypeEnum;
		withChoices?: boolean;
		/** if not provided, meaning it is create page */
		attributeID?: string;
		attributeName?: string;
		addValues: AttributeValueUpdateInput[];
		removeValues: string[];
	};

	let {
		inputType,
		attributeID,
		attributeName,
		addValues = $bindable(),
		removeValues = $bindable(),
	}: Props = $props();

	const ShowValues = $derived(
		[
			AttributeInputTypeEnum.Dropdown,
			AttributeInputTypeEnum.Numeric,
			AttributeInputTypeEnum.Multiselect,
			AttributeInputTypeEnum.Swatch,
		].includes(inputType),
	);

	let attributeChoicesVariables = $state({
		id: attributeID,
		first: 20,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(true);
	let valueItemToEdit = $state<AttributeValue>();
	let loading = $state(false);
	let openUpsertModal = $state(false);

	const ValueColumns: TableColumnProps<AttributeValue>[] = $derived([
		{
			title: 'name',
			child: name,
		},
		{
			title: inputType === AttributeInputTypeEnum.Swatch ? 'value' : 'slug',
			child: value,
		},
		{
			title: 'action',
			child: action,
		},
	]);

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

	const handleCreateAttributeValue = async () => {
		if (!valueItemToEdit) return;

		// if in update page
		if (attributeID) {
			loading = true;

			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'attributeValueCreate'>,
				MutationAttributeValueCreateArgs
			>(ATTRIBUTE_VALUE_CREATE_MUTATION, {
				attribute: attributeID!,
				input: {
					name: valueItemToEdit.name!,
					value: valueItemToEdit.value,
				},
			});

			loading = false;

			if (
				checkIfGraphqlResultHasError(
					result,
					'attributeValueCreate',
					$tranFunc('common.createSuccess'),
				)
			)
				return;

			forceReExecuteGraphqlQuery = true;
			valueItemToEdit = undefined;
		} else {
			addValues.push({
				name: valueItemToEdit.name!,
				value: valueItemToEdit.value,
			});
			valueItemToEdit = undefined;
		}
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
		{:else}
			<span>{item.slug}</span>
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
			onclick={() => {
				valueItemToEdit = item;
				openUpsertModal = true;
			}}
			data-interactive
			disabled={loading}
		/>
	</div>
{/snippet}

{#if ShowValues}
	<div class={SitenameCommonClassName}>
		{#if inputType !== AttributeInputTypeEnum.Numeric}
			<SectionHeader>
				<div>Attribute values</div>
				<Button size="xs" variant="light" endIcon={Plus} onclick={() => (openUpsertModal = true)}>
					Add value
				</Button>
			</SectionHeader>

			<!-- if this is edit page -->
			{#if attributeID}
				<GraphqlPaginableTable
					query={ATTRIBUTE_VALUES_QUERY}
					resultKey={'attribute.choices' as keyof Query}
					columns={ValueColumns}
					bind:variables={attributeChoicesVariables}
					disabled={loading}
					bind:forceReExecuteGraphqlQuery
					onDragEnd={handleArrangeValues}
					dragEffectType="move-position"
				/>
			{/if}
		{:else}
			<div>
				<Checkbox label="Select unit" />
			</div>
		{/if}
	</div>
{/if}

<Modal
	size="sm"
	open={openUpsertModal}
	header="Upsert attribute value"
	closeOnEscape
	closeOnOutsideClick
	disableElements={loading}
	onCancel={noop}
	onOk={handleUpdateAttributeValue}
	onClose={() => {
		openUpsertModal = false;
	}}
>
	{#if !!valueItemToEdit}
		<!-- edit value -->
		{#if valueItemToEdit?.inputType === AttributeInputTypeEnum.Swatch}
			<ColorPicker bind:hex={valueItemToEdit.value} position="responsive" />
		{:else if valueItemToEdit?.inputType === AttributeInputTypeEnum.Dropdown}
			<Input label="Value" placeholder="Value" bind:value={valueItemToEdit.name} />
		{:else if valueItemToEdit?.inputType === AttributeInputTypeEnum.Multiselect}
			<Input label="Value" placeholder="Value" bind:value={valueItemToEdit.name} />
		{/if}
	{:else}
		<div>lol</div>
	{/if}
</Modal>
