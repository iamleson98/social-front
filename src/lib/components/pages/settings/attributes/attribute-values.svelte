<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		ATTRIBUTE_VALUE_CREATE_MUTATION,
		ATTRIBUTE_VALUE_UPDATE_MUTATION,
		ATTRIBUTE_VALUES_BULK_DELETE,
		ATTRIBUTE_VALUES_QUERY,
		REORDER_ATTRIBUTE_VALUES_MUTATION,
	} from '$lib/api/admin/attribute';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		type TableCellProps,
		type TableColumnProps,
		reFetchTableData,
	} from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type Query,
		type AttributeValue,
		type Mutation,
		type MutationAttributeReorderValuesArgs,
		type MutationAttributeValueUpdateArgs,
		type AttributeValueUpdateInput,
		type MutationAttributeValueCreateArgs,
		MeasurementUnitsEnum,
		type AttributeValueCreateInput,
		type MutationAttributeValueBulkDeleteArgs,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import {
		HumanizeUnit,
		inferMetricSystemAndUnitsOfFromUnit,
		MetricClassification,
		MetricSystem,
		MetricUnit,
	} from './consts';
	import ColorPicker, { ChromeVariant } from 'svelte-awesome-color-picker';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		inputType: AttributeInputTypeEnum;
		withChoices?: boolean;
		/** if not provided, meaning it is create page */
		attributeID?: string;
		addValues: AttributeValueUpdateInput[];
		removeValues: string[];
		unit?: MeasurementUnitsEnum;
		disabled?: boolean;
	};

	let {
		inputType,
		attributeID,
		addValues = $bindable(),
		removeValues = $bindable(),
		unit = $bindable(),
		disabled,
	}: Props = $props();

	const ShowValues = $derived(
		[
			AttributeInputTypeEnum.Dropdown,
			AttributeInputTypeEnum.Numeric,
			AttributeInputTypeEnum.Multiselect,
			AttributeInputTypeEnum.Swatch,
		].includes(inputType),
	);

	const MetricSystems = Object.values(MetricSystem).map<SelectOption>((value) => ({
		label: $tranFunc(`attributes.${value}`),
		value,
	}));

	const MetricUnits = Object.values(MetricUnit).map<SelectOption>((value) => ({
		label: $tranFunc(`attributes.${value}`),
		value,
	}));

	const ValueColumns: TableColumnProps<AttributeValue>[] = $derived([
		{
			title: selectAll,
			child: selectValue,
		},
		{
			title: $tranFunc('common.name'),
			child: { render: ({ item }) => item.name },
		},
		{
			title:
				inputType === AttributeInputTypeEnum.Swatch
					? $tranFunc('common.value')
					: $tranFunc('common.slug'),
			child: value,
		},
		{
			title: $tranFunc('common.action'),
			child: action,
		},
	]);

	let attributeChoicesVariables = $state({
		id: attributeID,
		first: 20,
		filter: {
			search: '',
		},
	});
	let valueItemToEdit = $state<AttributeValue>();
	let valueItemToCreate = $state<AttributeValueCreateInput>();
	let openUpsertModal = $state(false);
	let metricSystem = $state<MetricSystem>();
	let metricUnitsOf = $state<MetricUnit>();
	let selectedAttributes = $state(new SvelteSet<string>());

	const shouldDisableOkButton = $derived.by(() => {
		if (inputType === AttributeInputTypeEnum.Swatch)
			return valueItemToEdit ? !valueItemToEdit?.value?.trim() : !valueItemToCreate?.value?.trim();
		return valueItemToEdit ? !valueItemToEdit?.name?.trim() : !valueItemToCreate?.name.trim();
	});

	const FinalUnitOptions = $derived.by(() => {
		if (metricSystem && metricUnitsOf)
			return MetricClassification[metricSystem][metricUnitsOf].map<SelectOption>((value) => ({
				value,
				label: HumanizeUnit[value],
			}));

		return [];
	});

	$effect(() => {
		if (unit) {
			const result = inferMetricSystemAndUnitsOfFromUnit(unit);
			if (Array.isArray(result)) {
				const [unitsOf, system] = result;
				metricUnitsOf = unitsOf as MetricUnit;
				metricSystem = system as MetricSystem;
			}
		}
	});

	const AttrValuesBulkDeleteStore = operationStore<
		Pick<Mutation, 'attributeValueBulkDelete'>,
		MutationAttributeValueBulkDeleteArgs
	>({
		query: ATTRIBUTE_VALUES_BULK_DELETE,
		variables: {
			ids: [],
		},
		pause: true,
		onResult: (result) => {
			if (
				checkIfGraphqlResultHasError(result, 'attributeValueBulkDelete', $CommonState.DeleteSuccess)
			)
				return;
			reFetchTableData(TableNameKeys.AttributeValuesTable);
			selectedAttributes.clear();
		},
	});

	const AttrValuesArrangeStore = operationStore<
		Pick<Mutation, 'attributeReorderValues'>,
		MutationAttributeReorderValuesArgs
	>({
		query: REORDER_ATTRIBUTE_VALUES_MUTATION,
		variables: {
			attributeId: '',
			moves: [],
		},
		pause: true,
		onResult: (result) => {
			if (checkIfGraphqlResultHasError(result, 'attributeReorderValues', $CommonState.EditSuccess))
				return;
			reFetchTableData(TableNameKeys.AttributeValuesTable);
		},
	});

	const UpdateAttrValueStore = operationStore<
		Pick<Mutation, 'attributeValueUpdate'>,
		MutationAttributeValueUpdateArgs
	>({
		query: ATTRIBUTE_VALUE_UPDATE_MUTATION,
		variables: {
			id: undefined,
			input: {},
		},
		pause: true,
		onResult: (result) => {
			if (checkIfGraphqlResultHasError(result, 'attributeValueUpdate', $CommonState.EditSuccess))
				return;
			reFetchTableData(TableNameKeys.AttributeValuesTable);
			valueItemToEdit = undefined;
			openUpsertModal = false;
		},
	});

	const AtttributeCreateStore = operationStore<
		Pick<Mutation, 'attributeValueCreate'>,
		MutationAttributeValueCreateArgs
	>({
		query: ATTRIBUTE_VALUE_CREATE_MUTATION,
		variables: {
			attribute: '',
			input: {
				name: '',
			},
		},
		pause: true,
		onResult: (result) => {
			if (checkIfGraphqlResultHasError(result, 'attributeValueCreate', $CommonState.CreateSuccess))
				return;
			reFetchTableData(TableNameKeys.AttributeValuesTable);
			openUpsertModal = false;
		},
	});

	let loading = $derived(
		$AttrValuesBulkDeleteStore.fetching ||
			$AttrValuesArrangeStore.fetching ||
			$UpdateAttrValueStore.fetching ||
			$AtttributeCreateStore.fetching,
	);

	const handleArrangeValues = async (
		dragIndex: number,
		dragItem: AttributeValue,
		dropIndex: number,
		_dropItem: AttributeValue,
	) => {
		if (dragIndex === dropIndex) return;

		AttrValuesArrangeStore.reexecute({
			variables: {
				attributeId: attributeID!,
				moves: [{ id: dragItem.id, sortOrder: dropIndex - dragIndex }],
			},
		});
	};

	const handleUpdateAttributeValue = async () => {
		if (!valueItemToEdit) return;

		UpdateAttrValueStore.reexecute({
			variables: {
				id: valueItemToEdit.id,
				input: {
					name: valueItemToEdit.name,
					value: valueItemToEdit.value,
				},
			},
		});
	};

	const handleCreateAttributeValue = async () => {
		if (!valueItemToCreate) return;

		// if in update page
		if (attributeID) {
			AtttributeCreateStore.reexecute({
				variables: {
					attribute: attributeID,
					input: valueItemToCreate,
				},
			});
		} else {
			addValues.push({ ...valueItemToCreate });
		}

		valueItemToCreate = undefined;
	};

	const handleClickAddValue = () => {
		openUpsertModal = true;
		valueItemToCreate = {
			name: '',
			value: '',
		};
	};
</script>

{#snippet selectAll({ items }: { items: AttributeValue[] })}
	<Checkbox
		checked={selectedAttributes.size === items.length}
		size="sm"
		disabled={loading}
		onCheckChange={(checked) => {
			if (checked) selectedAttributes = new SvelteSet(items.map((item) => item.id));
			else selectedAttributes.clear();
		}}
	/>
{/snippet}

{#snippet selectValue({ item }: TableCellProps<AttributeValue>)}
	<Checkbox
		checked={selectedAttributes.has(item.id)}
		size="sm"
		disabled={loading}
		data-interactive
		onCheckChange={(checked) => {
			selectedAttributes[checked ? 'add' : 'delete'](item.id);
		}}
	/>
{/snippet}

{#snippet value({ item }: TableCellProps<AttributeValue>)}
	<div class="flex items-center gap-2">
		{#if item.inputType === AttributeInputTypeEnum.Swatch}
			<span class="w-5 h-5 rounded-lg" style="background-color: {item.value};"></span>
			<span style="color: {item.value};">{item.value}</span>
		{:else}
			<span>{item.slug}</span>
		{/if}
	</div>
{/snippet}

{#snippet action({ item }: TableCellProps<AttributeValue>)}
	<div class="text-center">
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
				<div>{$tranFunc('attributes.attrVals')}</div>

				<div class="flex items-center gap-1">
					{#if selectedAttributes.size}
						<IconButton
							size="xs"
							color="red"
							variant="light"
							icon={Trash}
							onclick={() =>
								AttrValuesBulkDeleteStore.reexecute({
									variables: { ids: [...selectedAttributes] },
								})}
						/>
					{/if}
					<Button
						size="xs"
						variant="light"
						endIcon={Plus}
						onclick={handleClickAddValue}
						disabled={loading || !inputType}
					>
						{$tranFunc('product.addValue')}
					</Button>
				</div>
			</SectionHeader>

			<!-- if this is edit page -->
			{#if attributeID}
				<GraphqlPaginableTable
					tableName={TableNameKeys.AttributeValuesTable}
					query={ATTRIBUTE_VALUES_QUERY}
					resultKey={'attribute.choices' as keyof Query}
					columns={ValueColumns}
					bind:variables={attributeChoicesVariables}
					disabled={loading}
					onDragEnd={handleArrangeValues}
					dragEffectType="move-position"
					autoRefetchOnPaginationParamsChange
					autoFetchDataOnMount
				/>
			{/if}
		{:else}
			<SectionHeader>
				<div>{$tranFunc('attributes.selectUnit')}</div>
			</SectionHeader>

			<div class="grid grid-cols-3 gap-2">
				<Select
					label={$tranFunc('attributes.system')}
					placeholder={$tranFunc('attributes.system')}
					options={MetricSystems}
					size="sm"
					bind:value={metricSystem}
					disabled={loading}
				/>
				<Select
					label={$tranFunc('attributes.unitsOf')}
					placeholder={$tranFunc('attributes.unitsOf')}
					options={MetricUnits}
					size="sm"
					bind:value={metricUnitsOf}
					disabled={loading || !metricSystem}
				/>
				<Select
					label={$tranFunc('giftcard.form.unit')}
					placeholder={$tranFunc('giftcard.form.unit')}
					size="sm"
					disabled={loading || !metricUnitsOf}
					bind:value={unit as string}
					options={FinalUnitOptions}
				/>
			</div>
		{/if}
	</div>
{/if}

<Modal
	size="sm"
	open={openUpsertModal}
	header={$tranFunc('attributes.upsertValue')}
	disableElements={loading}
	onOk={() => (valueItemToEdit ? handleUpdateAttributeValue() : handleCreateAttributeValue())}
	onClose={() => (openUpsertModal = false)}
	onCancel={() => (openUpsertModal = false)}
	disableOkBtn={shouldDisableOkButton}
	okText={valueItemToEdit ? $tranFunc('btn.update') : $tranFunc('btn.add')}
	cancelText={$tranFunc('common.cancel')}
>
	{#if valueItemToEdit}
		<!-- edit value -->
		{#if inputType === AttributeInputTypeEnum.Swatch}
			<ColorPicker
				bind:hex={valueItemToEdit.value}
				position="responsive"
				isDialog={false}
				sliderDirection="horizontal"
				components={ChromeVariant}
			/>
		{:else if inputType === AttributeInputTypeEnum.Dropdown}
			<Input
				label={$tranFunc('placeholders.valuePlaceholder')}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				bind:value={valueItemToEdit.name}
				{disabled}
			/>
		{:else if inputType === AttributeInputTypeEnum.Multiselect}
			<Input
				{disabled}
				label={$tranFunc('placeholders.valuePlaceholder')}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				bind:value={valueItemToEdit.name}
			/>
		{/if}
	{:else if valueItemToCreate}
		<!-- add value -->
		{#if inputType === AttributeInputTypeEnum.Swatch}
			<ColorPicker
				bind:hex={valueItemToCreate.value}
				position="responsive"
				isDialog={false}
				sliderDirection="horizontal"
				components={ChromeVariant}
			/>
		{:else if inputType === AttributeInputTypeEnum.Dropdown}
			<Input
				{disabled}
				label={$tranFunc('placeholders.valuePlaceholder')}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				bind:value={valueItemToCreate.name}
			/>
		{:else if inputType === AttributeInputTypeEnum.Multiselect}
			<Input
				{disabled}
				label={$tranFunc('placeholders.valuePlaceholder')}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				bind:value={valueItemToCreate.name}
			/>
		{/if}
	{/if}
</Modal>
