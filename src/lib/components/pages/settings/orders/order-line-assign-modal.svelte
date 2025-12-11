<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ORDER_LINES_CREATE_MUTATION, VARIANTS_FOR_ORDER_QUERY } from '$lib/api/admin/orders';
	import { operationStore } from '$lib/api/operation';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Plus, Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, DebounceInput } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		ROW_OPTIONS,
		type GraphqlPaginableTableInterface,
		type TableCellProps,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import type {
		Mutation,
		MutationOrderLinesCreateArgs,
		Product,
		QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError, stringSlicer } from '$lib/utils/utils';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		orderId: string;
		orderChannelSlug: string;
		onAddedOrderLines?: () => void;
	};

	let { orderId, onAddedOrderLines, orderChannelSlug }: Props = $props();

	const COLUMNS: TableColumnProps<Product>[] = $derived([
		{
			title: $tranFunc('common.action'),
			child: checkbox,
		},
		{
			title: $tranFunc('common.pic'),
			child: image,
		},
		{
			title: $tranFunc('common.name'),
			child: name,
		},
		{
			title: $tranFunc('common.variants'),
			child: variants,
		},
	]);

	const BATCH = ROW_OPTIONS[0];

	let addVariantIds = $state(new SvelteSet<string>());
	let openVariantsModal = $state(false);
	let variantTableRef = $state<GraphqlPaginableTableInterface>();
	let variables = $state.raw<QueryProductsArgs>({
		first: BATCH,
		channel: orderChannelSlug,
		filter: { search: '' },
	});
	let searchProductsQuery = $state('');

	$effect(() => {
		if (searchProductsQuery !== variables.filter?.search) {
			variables = {
				...variables,
				filter: { search: searchProductsQuery },
			};
			variantTableRef?.triggerFetchData();
		}
	});

	const CreateOrderLineMutation = operationStore<
		Pick<Mutation, 'orderLinesCreate'>,
		MutationOrderLinesCreateArgs
	>({
		query: ORDER_LINES_CREATE_MUTATION,
		variables: {
			id: orderId,
			input: [],
		},
		pause: true,
		onResult: (result) => {
			if (
				checkIfGraphqlResultHasError(
					result,
					'orderLinesCreate',
					'Successfully added variants to order',
				)
			)
				return;

			addVariantIds.clear();
			onAddedOrderLines?.();
			openVariantsModal = false;
		},
	});

	const handleAddOrderLine = async () => {
		if (!addVariantIds.size) return;

		CreateOrderLineMutation.reexecute({
			variables: {
				id: orderId,
				input: [...addVariantIds].map((id) => ({ variantId: id, quantity: 1 })),
			},
		});
	};

	const handleClickAddProductVariants = async () => {
		addVariantIds.clear();
		openVariantsModal = true;
		variantTableRef?.triggerFetchData();
	};
</script>

{#snippet checkbox({ item }: TableCellProps<Product>)}
	{@const checked = item.variants?.length
		? item.variants.every((variant) => addVariantIds.has(variant.id))
		: false}
	<Checkbox
		size="sm"
		{checked}
		onCheckChange={(check) => {
			const operator = check ? 'add' : 'delete';
			item.variants?.forEach((variant) => addVariantIds[operator](variant.id));
		}}
		disabled={$CreateOrderLineMutation.fetching}
	/>
{/snippet}

{#snippet image({ item }: TableCellProps<Product>)}
	<Thumbnail size="sm" src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} />
{/snippet}

{#snippet name({ item }: TableCellProps<Product>)}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link" title={item.name}>
		{stringSlicer(item.name, 50)}
	</a>
{/snippet}

{#snippet variants({ item }: TableCellProps<Product>)}
	{#if item.variants?.length}
		{#each item.variants as variant, idx (idx)}
			<div
				class={[
					'flex justify-between items-center py-1',
					idx < item.variants.length - 1 && 'border-b border-gray-200',
				]}
			>
				<Checkbox
					size="sm"
					label={variant.name}
					subText={`SKU: ${variant.sku}`}
					checked={addVariantIds.has(variant.id)}
					onCheckChange={(checked) => addVariantIds[checked ? 'add' : 'delete'](variant.id)}
					disabled={$CreateOrderLineMutation.fetching}
				/>
				<PriceDisplay
					amount={variant.pricing?.price?.gross.amount || 0}
					currency={variant.pricing?.price?.gross.currency || '-'}
				/>
			</div>
		{/each}
	{:else}
		<div>-</div>
	{/if}
{/snippet}

<Button endIcon={Plus} size="xs" onclick={handleClickAddProductVariants}>Add Products</Button>

<Modal
	closeOnEscape
	closeOnOutsideClick
	size="md"
	open={openVariantsModal}
	header="Select product variants"
	onClose={() => (openVariantsModal = false)}
	onCancel={() => (openVariantsModal = false)}
	onOk={handleAddOrderLine}
	disableElements={$CreateOrderLineMutation.fetching}
>
	<Alert size="sm" class="mb-1.5">
		You can only add products available for the order's channel
	</Alert>
	<DebounceInput
		startIcon={Search}
		placeholder="Enter your query"
		class="mb-1.5"
		debounceTime={888}
		bind:value={searchProductsQuery}
		disabled={$CreateOrderLineMutation.fetching}
	/>
	<GraphqlPaginableTable
		columns={COLUMNS}
		query={VARIANTS_FOR_ORDER_QUERY}
		resultKey="products"
		bind:variables
		disabled={$CreateOrderLineMutation.fetching}
		autoRefetchOnPaginationParamsChange
		autoFetchDataOnMount
		bind:this={variantTableRef}
	/>
</Modal>
