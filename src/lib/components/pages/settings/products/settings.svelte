<script lang="ts">
	import { T } from '$i18n';
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
	import type { SvelteSet } from 'svelte/reactivity';

	type Props = {
		variables: QueryProductsArgs;
		selectedIds: SvelteSet<string>;
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
		label: $T(`product.${value}`),
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
			exportConfig.ids = selectedIds.keys().toArray();
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
				$T('product.exportSuccessMsg', { fileType: exportConfig.fileType }),
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
			children: $T('product.exportPrds'),
			onclick: handleClickExportProducts,
		},
	]}
>
	{#snippet trigger({ onclick })}
		<IconButton
			size="sm"
			icon={SettingCog}
			color="gray"
			{onclick}
			class="tooltip tooltip-left"
			data-tip={$T('common.settings')}
		/>
	{/snippet}
</DropDown>

<Modal
	header={$T('product.exportPrds')}
	open={openExportModal}
	size="sm"
	onCancel={() => (openExportModal = false)}
	onClose={() => (openExportModal = false)}
	closeOnEscape
	okText={$T('common.export')}
	onOk={handleExport}
	closeOnOutsideClick
	disableElements={loading}
>
	<div class="space-y-2">
		<ChannelSelect
			multiple
			label={$T('channel.channels')}
			placeholder={$T('channel.channels')}
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
			label={$T('attributes.attrs')}
			placeholder={$T('attributes.attrs')}
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
			label={$T('channel.warehouse')}
			placeholder={$T('channel.warehouse')}
			multiple
			disabled={loading}
			bind:value={exportConfig.exportInfo!.warehouses}
		/>
		<Select
			options={ProductFields}
			label={$T('product.exportOrganization')}
			placeholder={$T('product.exportOrganization')}
			bind:value={exportConfig.exportInfo!.fields as string[]}
			multiple
			disabled={loading}
		/>
		<Label label={$T('product.exportAs')} />
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
			<Label label={$T('product.exportFor')} />
			<div class="space-y-1.5">
				<RadioButton
					value={ExportScope.All}
					label={`${$T('product.exportScopeAll')} (${$ProductTotalCountQuery.data.products?.totalCount})`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Ids}
					label={`${$T('product.exportScopeIds')} (${selectedIds.size})`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Filter}
					label={$T('product.exportScopeFilter')}
					bind:group={exportConfig.scope}
					size="sm"
				/>
			</div>
		{/if}
	</div>
</Modal>
