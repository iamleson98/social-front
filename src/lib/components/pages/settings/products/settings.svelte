<script lang="ts">
	import { PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import { EXPORT_PRODUCTS_MUTATION, PRODUCT_TOTAL_COUNT_QUERY } from '$lib/api/admin/product';
	import { WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { SettingCog } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { CheckboxSkeleton, Label, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import {
		type ExportProductsInput,
		ExportScope,
		FileTypesEnum,
		type Mutation,
		type MutationExportProductsArgs,
		ProductFieldEnum,
		type Query,
		type QueryAttributesArgs,
		type QueryProductsArgs,
		type QueryWarehousesArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	type Props = {
		variables: QueryProductsArgs;
		selectedIds: Record<string, boolean>;
	};

	let { variables = $bindable(), selectedIds = $bindable() }: Props = $props();

	const ProductTotalCountQuery = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		query: PRODUCT_TOTAL_COUNT_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	let openExportModal = $state(false);
	const ProductFields = Object.values(ProductFieldEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase().replace(/_/g, ' '),
	}));
	let loading = $state(false);
	let exportConfig = $state<ExportProductsInput>({
		fileType: FileTypesEnum.Xlsx,
		scope: ExportScope.All,
		exportInfo: {
			attributes: [],
			channels: [],
			fields: [],
			warehouses: [],
		},
		filter: null,
	});

	$effect(() => {
		if (exportConfig.scope === ExportScope.All) {
			exportConfig.ids = null;
			exportConfig.filter = null;
		} else if (exportConfig.scope === ExportScope.Ids) {
			exportConfig.filter = null;
			exportConfig.ids = Object.keys(selectedIds);
		} else if (exportConfig.scope === ExportScope.Filter) {
			exportConfig.ids = null;
			exportConfig.filter = variables.filter;
		}
	});

	const handleClickExportProducts = () => {
		openExportModal = true;
		ProductTotalCountQuery.reexecute({ variables: {} });
	};

	const handleExport = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'exportProducts'>,
			MutationExportProductsArgs
		>(EXPORT_PRODUCTS_MUTATION, {
			input: exportConfig,
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'exportProducts',
				`We are currently exporting your requested ${exportConfig.fileType.toLowerCase()}.As soon as it is available it will be sent to your email address`,
			)
		)
			return;

		openExportModal = false;
	};
</script>

<DropDown
	placement="bottom-end"
	options={[
		{
			children: 'Export products',
			onclick: handleClickExportProducts,
		},
	]}
>
	{#snippet trigger({ onclick }: DropdownTriggerInterface)}
		<IconButton
			size="sm"
			icon={SettingCog}
			color="gray"
			{onclick}
			class="tooltip tooltip-left"
			data-tip="Settings"
		/>
	{/snippet}
</DropDown>

<Modal
	header="Export products"
	open={openExportModal}
	size="sm"
	onCancel={() => (openExportModal = false)}
	onClose={() => (openExportModal = false)}
	closeOnEscape
	okText="Export"
	onOk={handleExport}
	closeOnOutsideClick
	disableElements={loading}
>
	<div class="space-y-2">
		<ChannelSelect
			multiple
			label="Channels"
			placeholder="Select channels"
			valueType="id"
			bind:value={exportConfig.exportInfo!.channels}
			disabled={loading}
		/>
		<GraphqlPaginableSelect
			query={PRODUCT_ATTRIBUTES_QUERY}
			resultKey="attributes"
			variables={{ first: 15, filter: { search: '' } } as QueryAttributesArgs}
			variableSearchQueryPath="filter.search"
			optionValueKey="id"
			optionLabelKey="name"
			label="Attributes"
			placeholder="Select attributes"
			multiple
			disabled={loading}
			bind:value={exportConfig.exportInfo!.attributes}
		/>
		<GraphqlPaginableSelect
			query={WAREHOUSE_LIST_QUERY}
			resultKey="warehouses"
			variables={{ first: 15, filter: { search: '' } } as QueryWarehousesArgs}
			variableSearchQueryPath="filter.search"
			optionValueKey="id"
			optionLabelKey="name"
			label="Warehouses"
			placeholder="Select warehouses"
			multiple
			disabled={loading}
			bind:value={exportConfig.exportInfo!.warehouses}
		/>
		<Select
			options={ProductFields}
			label="Product organization"
			placeholder="Product organization"
			bind:value={exportConfig.exportInfo!.fields as string[]}
			multiple
			disabled={loading}
		/>
		<Label label="Export as" />
		<div class="space-y-1.5">
			{#each Object.values(FileTypesEnum) as value, idx (idx)}
				<RadioButton
					size="sm"
					{value}
					label={value.toLowerCase()}
					bind:group={exportConfig.fileType}
					disabled={loading}
				/>
			{/each}
		</div>

		{#if $ProductTotalCountQuery.fetching}
			<div class="flex flex-col gap-1.5">
				<CheckboxSkeleton label />
				<CheckboxSkeleton label />
			</div>
		{:else if $ProductTotalCountQuery.error}
			<Alert size="sm" variant="error">{$ProductTotalCountQuery.error.message}</Alert>
		{:else if $ProductTotalCountQuery.data}
			<Label label="Export information for" />
			<div class="space-y-1.5">
				<RadioButton
					value={ExportScope.All}
					label={`All products (${$ProductTotalCountQuery.data.products?.totalCount})`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Ids}
					label={`Selected products (${Object.keys(selectedIds).length})`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Filter}
					label={`Current search`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
			</div>
		{/if}
	</div>
</Modal>
