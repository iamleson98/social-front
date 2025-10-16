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
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type Query,
		type AttributeValue,
		type Mutation,
		type MutationAttributeReorderValuesArgs,
		type MutationAttributeValueDeleteArgs,
		type MutationAttributeValueUpdateArgs,
		type AttributeValueUpdateInput,
		type MutationAttributeValueCreateArgs,
		MeasurementUnitsEnum,
		type AttributeValueCreateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
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
			title: $tranFunc('common.name'),
			child: name,
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
	let forceReExecuteGraphqlQuery = $state(true);
	let valueItemToEdit = $state<AttributeValue>();
	let valueItemToCreate = $state<AttributeValueCreateInput>();
	let loading = $state(false);
	let openUpsertModal = $state(false);
	let metricSystem = $state<MetricSystem>();
	let metricUnitsOf = $state<MetricUnit>();
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

	const handleDeleteValue = async (item: AttributeValue) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
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
					checkIfGraphqlResultHasError(result, 'attributeValueDelete', $CommonState.DeleteSuccess)
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

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeReorderValues'>,
			MutationAttributeReorderValuesArgs
		>(REORDER_ATTRIBUTE_VALUES_MUTATION, {
			attributeId: attributeID!,
			moves: [{ id: dragItem.id, sortOrder: dropIndex - dragIndex }],
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'attributeReorderValues', $CommonState.EditSuccess))
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

		if (checkIfGraphqlResultHasError(result, 'attributeValueUpdate', $CommonState.EditSuccess))
			return;

		forceReExecuteGraphqlQuery = true;
		valueItemToEdit = undefined;
	};

	const handleCreateAttributeValue = async () => {
		if (!valueItemToCreate) return;

		// if in update page
		if (attributeID) {
			loading = true;

			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'attributeValueCreate'>,
				MutationAttributeValueCreateArgs
			>(ATTRIBUTE_VALUE_CREATE_MUTATION, {
				attribute: attributeID,
				input: valueItemToCreate,
			});

			loading = false;

			if (checkIfGraphqlResultHasError(result, 'attributeValueCreate', $CommonState.CreateSuccess))
				return;

			forceReExecuteGraphqlQuery = true;
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
			disabled={loading || disabled}
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
			disabled={loading || disabled}
		/>
	</div>
{/snippet}

{#if ShowValues}
	<div class={SitenameCommonClassName}>
		{#if inputType !== AttributeInputTypeEnum.Numeric}
			<SectionHeader>
				<div>{$tranFunc('attributes.attrVals')}</div>
				<Button
					size="xs"
					variant="light"
					endIcon={Plus}
					onclick={handleClickAddValue}
					disabled={loading || !inputType || disabled}
				>
					{$tranFunc('product.addValue')}
				</Button>
			</SectionHeader>

			<!-- if this is edit page -->
			{#if attributeID}
				<GraphqlPaginableTable
					query={ATTRIBUTE_VALUES_QUERY}
					resultKey={'attribute.choices' as keyof Query}
					columns={ValueColumns}
					bind:variables={attributeChoicesVariables}
					disabled={loading || disabled}
					bind:forceReExecuteGraphqlQuery
					onDragEnd={handleArrangeValues}
					dragEffectType="move-position"
					autoRefetchOnVariableChange
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
					disabled={loading || disabled}
				/>
				<Select
					label={$tranFunc('attributes.unitsOf')}
					placeholder={$tranFunc('attributes.unitsOf')}
					options={MetricUnits}
					size="sm"
					bind:value={metricUnitsOf}
					disabled={loading || !metricSystem || disabled}
				/>
				<Select
					label={$tranFunc('giftcard.form.unit')}
					placeholder={$tranFunc('giftcard.form.unit')}
					size="sm"
					disabled={loading || !metricUnitsOf || disabled}
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
	closeOnEscape
	closeOnOutsideClick
	disableElements={loading}
	onOk={() => (valueItemToEdit ? handleUpdateAttributeValue() : handleCreateAttributeValue())}
	onClose={() => (openUpsertModal = false)}
	onCancel={() => (openUpsertModal = false)}
	disableOkBtn={shouldDisableOkButton || disabled}
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
