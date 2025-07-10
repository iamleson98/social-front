<script lang="ts">
	import { VARIANTS_FOR_ORDER_QUERY } from '$lib/api/admin/orders';
	import { CHANNEL_DETAILS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Search } from '$lib/components/icons';
	import Alert from '$lib/components/ui/Alert/alert.svelte';
	import { Checkbox, DebounceInput } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		TableSkeleton,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import {
		MenuItemsSortField,
		type AddressInput,
		type Product,
		type Query,
		type QueryChannelArgs,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { classNames, stringSlicer } from '$lib/utils/utils';
	import { get, set } from 'es-toolkit/compat';

	type Props = {
		open: boolean;
		channelSlug: string;
	};

	let { open = $bindable(), channelSlug }: Props = $props();

	const BATCH = 15;

	type Variables = QueryProductsArgs & {
		address?: AddressInput;
	};

	let variables = $state.raw<Variables>({
		first: BATCH,
		channel: channelSlug,
		filter: { search: '' },
	});
	let searchProductsQuery = $state('');
	let forceReExecuteGraphqlQuery = $state(true);

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

	$effect(() => {
		if (searchProductsQuery !== get(variables, 'filter.search')) {
			const newVariables = { ...variables };
			set(newVariables, 'filter.search', searchProductsQuery);
			variables = newVariables;
			forceReExecuteGraphqlQuery = true;
		}
	});
</script>

{#snippet checkbox({ item }: { item: Product })}
	<Checkbox size="sm" />
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
				<Checkbox size="sm" label={variant.name} subText={`SKU: ${variant.sku}`} />
				<PriceDisplay
					amount={variant.pricing?.price?.gross.amount || 0}
					currency={variant.pricing?.price?.gross.currency || '-'}
				/>
			</div>
		{/each}
	{/if}
{/snippet}

<Modal
	closeOnEscape
	closeOnOutsideClick
	size="md"
	{open}
	header="Select product variants"
	onClose={() => (open = false)}
	onCancel={() => (open = false)}
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
	/>
	<GraphqlPaginableTable
		columns={COLUMNS}
		query={VARIANTS_FOR_ORDER_QUERY}
		resultKey="products"
		bind:variables
		bind:forceReExecuteGraphqlQuery
	/>
</Modal>
