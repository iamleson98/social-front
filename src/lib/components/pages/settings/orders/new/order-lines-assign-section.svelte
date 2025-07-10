<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import {
		type AddressInput,
		type Mutation,
		type MutationOrderLinesCreateArgs,
		type Order,
		type Product,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError, classNames, stringSlicer } from '$lib/utils/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { get, set } from 'es-toolkit/compat';
	import { Checkbox, DebounceInput } from '$lib/components/ui/Input';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { AppRoute } from '$lib/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Modal } from '$lib/components/ui/Modal';
	import { ORDER_LINES_CREATE_MUTATION, VARIANTS_FOR_ORDER_QUERY } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { omit } from 'es-toolkit';

	type Props = {
		order: Order;
		onAddedVariants: () => void;
	};

	type Variables = QueryProductsArgs & {
		address?: AddressInput;
	};
	const BATCH = 15;

	let { order, onAddedVariants }: Props = $props();

	let openVariantsModal = $state(false);

	let variables = $state.raw<Variables>({
		first: BATCH,
		channel: order.channel.slug,
		filter: { search: '' },
	});
	let searchProductsQuery = $state('');
	let forceReExecuteGraphqlQuery = $state(true);
	let addVariantIds = $state.raw<Record<string, boolean>>({});
	let loading = $state(false);

	const COLUMNS: TableColumnProps<Product>[] = [
		{
			title: 'Action',
			child: checkbox,
		},
		{
			title: 'Image',
			child: image,
		},
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Variants',
			child: variants,
		},
	];

	const handleClickAddProductVariants = async () => {
		addVariantIds = {};
		openVariantsModal = true;
		forceReExecuteGraphqlQuery = true;
	};

	$effect(() => {
		if (searchProductsQuery !== get(variables, 'filter.search')) {
			const newVariables = { ...variables };
			set(newVariables, 'filter.search', searchProductsQuery);
			variables = newVariables;
			forceReExecuteGraphqlQuery = true;
		}
	});

	const handleToggleVariants = async (check: boolean, ...variantIds: string[]) => {
		if (!variantIds.length) return;

		if (check) {
			const newObj = variantIds.reduce(
				(acc, cur) => ({ ...acc, [cur]: true }),
				{} as Record<string, boolean>,
			);

			addVariantIds = {
				...addVariantIds,
				...newObj,
			};
		} else {
			addVariantIds = omit(addVariantIds, variantIds);
		}
	};

	const handleAddOrderLine = async () => {
		const variantIds = Object.keys(addVariantIds);

		if (!variantIds.length) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLinesCreate'>,
			MutationOrderLinesCreateArgs
		>(ORDER_LINES_CREATE_MUTATION, {
			id: order.id,
			input: variantIds.map((id) => ({ variantId: id, quantity: 1 })),
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'orderLinesCreate',
				'Successfully added variants to order',
			)
		)
			return;

		onAddedVariants();
		openVariantsModal = false;
	};
</script>

<div class="rounded-lg border border-gray-200 p-3 bg-white">
	<SectionHeader>
		<div>Order Details</div>
		<Button
			endIcon={Plus}
			size="xs"
			variant="outline"
			color="gray"
			onclick={handleClickAddProductVariants}
		>
			Add Products
		</Button>
	</SectionHeader>

	{#if !order.lines.length}
		<Alert size="sm" bordered variant="warning"
			>This order has no product yet. Please add more.</Alert
		>
	{/if}
</div>

{#snippet checkbox({ item }: { item: Product })}
	{@const checked =
		!!item.variants?.length && item.variants.every((variant) => addVariantIds[variant.id])}
	<Checkbox
		size="sm"
		{checked}
		onchange={(evt) =>
			handleToggleVariants(
				evt.currentTarget.checked,
				...(item.variants || []).map((item) => item.id),
			)}
		disabled={loading}
	/>
{/snippet}

{#snippet image({ item }: { item: Product })}
	<Thumbnail size="sm" src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} />
{/snippet}

{#snippet name({ item }: { item: Product })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link" title={item.name}>
		{stringSlicer(item.name, 50)}
	</a>
{/snippet}

{#snippet variants({ item }: { item: Product })}
	{#if item.variants?.length}
		{#each item.variants as variant, idx (idx)}
			<div
				class={classNames('flex justify-between items-center py-1', {
					'border-b border-gray-200': idx < item.variants.length - 1,
				})}
			>
				<Checkbox
					size="sm"
					label={variant.name}
					subText={`SKU: ${variant.sku}`}
					checked={addVariantIds[variant.id]}
					onchange={(evt) => handleToggleVariants(evt.currentTarget.checked, variant.id)}
					disabled={loading}
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

<Modal
	closeOnEscape
	closeOnOutsideClick
	size="md"
	open={openVariantsModal}
	header="Select product variants"
	onClose={() => (openVariantsModal = false)}
	onCancel={() => (openVariantsModal = false)}
	onOk={handleAddOrderLine}
	disableElements={loading}
>
	<Alert size="xs" bordered class="mb-1.5">
		You can only add products available for the order's channel
	</Alert>
	<DebounceInput
		startIcon={Search}
		placeholder="Enter your query"
		class="mb-1.5"
		debounceTime={888}
		bind:value={searchProductsQuery}
		disabled={loading}
	/>
	<GraphqlPaginableTable
		columns={COLUMNS}
		query={VARIANTS_FOR_ORDER_QUERY}
		resultKey="products"
		bind:variables
		bind:forceReExecuteGraphqlQuery
		disabled={loading}
	/>
</Modal>
