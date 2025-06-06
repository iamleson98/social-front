<script lang="ts">
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { omit } from 'es-toolkit';
	import ProductAssignModal from './product-assign-modal.svelte';

	type Props = {
		disabled?: boolean;
		productsToAssign: string[];
	};

	let { disabled, productsToAssign = $bindable([]) }: Props = $props();

	let selectedProductsMap = $state<Record<string, Product | undefined>>({});

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: 'Pic',
			child: picture,
		},
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Category',
			child: category,
		},
		{
			title: 'Availability',
			child: availability,
		},
		{
			title: 'Action',
			child: action,
		},
	];

	const handleAssignProducts = async (_addProducts: Product[], _removeProductIds: string[]) => {
		productsToAssign = Object.values(selectedProductsMap)
			.filter(Boolean)
			.map((item) => item?.id) as string[];
	};

	const handleClickDelBtn = (item: Product) => {
		selectedProductsMap = omit(selectedProductsMap, [item.id]);
		handleAssignProducts([], []);
	};
</script>

{#snippet action({ item }: { item: Product })}
	<div class="text-center">
		<IconButton
			icon={Trash}
			variant="light"
			size="xs"
			color="red"
			onclick={() => handleClickDelBtn(item)}
			{disabled}
			data-interactive
		/>
	</div>
{/snippet}

{#snippet picture({ item }: { item: Product })}
	<div class="rounded-lg border border-gray-200 w-9 h-9 overflow-hidden">
		<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} class="w-full h-full" />
	</div>
{/snippet}

{#snippet name({ item }: { item: Product })}
	<a
		href={AppRoute.PRODUCT_DETAILS(item.slug)}
		aria-label={item.name}
		data-interactive
		class="link link-hover"
	>
		{item.name}
	</a>
{/snippet}

{#snippet category({ item }: { item: Product })}
	<div>{item.category?.name || '-'}</div>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	{@const channels =
		item.channelListings?.map((item) => ({
			channel: item.channel.name,
			published: item.isPublished,
		})) || []}
	{#snippet trigger({ onclick, onclose }: DropdownTriggerInterface)}
		<Badge
			text={`${channels.length} channels`}
			color={channels.length ? 'green' : 'orange'}
			variant={channels.length ? 'filled' : 'light'}
			onmouseenter={onclick}
			ontouchstart={onclick}
			onmouseleave={onclose}
		/>
	{/snippet}
	<Popover {trigger} placement="left" noReCalculateOnWindowResize>
		<div class="py-1 px-2 rounded-lg border border-gray-200 bg-white w-fit shadow-sm">
			<div class="flex flex-nowrap font-medium gap-1 text-sm">
				<span class="flex-1">channel</span>
				<span class="flex-1">status</span>
			</div>
			{#each channels as chan, idx (idx)}
				<div class="flex flex-nowrap mt-1 gap-1">
					<div class="flex-1">{chan.channel}</div>
					<div class="flex-1">
						<Badge
							text={chan.published ? 'Published' : 'Unpublished'}
							size="xs"
							color={chan.published ? 'green' : 'red'}
						/>
					</div>
				</div>
			{/each}
		</div>
	</Popover>
{/snippet}

<div class="bg-white rounded-lg border w-full border-gray-200 p-3">
	<ProductAssignModal onApply={handleAssignProducts} {disabled} bind:selectedProductsMap />
	{#if productsToAssign.length}
		<Table
			columns={PRODUCT_COLUMNS}
			{disabled}
			items={Object.values(selectedProductsMap) as Product[]}
		/>
	{:else}
		<div class="text-center py-3 text-gray-600">No products assigned</div>
	{/if}
</div>
