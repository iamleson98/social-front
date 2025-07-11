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
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { tranFunc } from '$i18n';

	type Props = {
		disabled?: boolean;
		productsToAssign: string[];
	};

	let { disabled, productsToAssign = $bindable([]) }: Props = $props();

	let selectedProductsMap = $state<Record<string, Product | undefined>>({});

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = $derived([
		{
			title: $tranFunc('common.pic'),
			child: picture,
		},
		{
			title: $tranFunc('common.name'),
			child: name,
		},
		{
			title: $tranFunc('product.category'),
			child: category,
		},
		{
			title: $tranFunc('settings.availability'),
			child: availability,
		},
		{
			title: $tranFunc('settings.action'),
			child: action,
		},
	]);

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
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet name({ item }: { item: Product })}
	<a
		href={AppRoute.PRODUCT_DETAILS(item.slug)}
		aria-label={item.name}
		data-interactive
		class="link"
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
	<Popover placement="left" noReCalculateOnWindowResize>
		{#snippet trigger({ onclick, onclose }: DropdownTriggerInterface)}
			<Badge
				text="{channels.length} {$tranFunc('product.channel')}"
				color={channels.length ? 'green' : 'orange'}
				variant={channels.length ? 'filled' : 'light'}
				onmouseenter={onclick}
				ontouchstart={onclick}
				onmouseleave={onclose}
			/>
		{/snippet}
		<div class="py-1 px-2 rounded-lg border border-gray-200 bg-white w-fit shadow-sm">
			<div class="flex flex-nowrap font-medium gap-1 text-sm">
				<span class="flex-1">{$tranFunc('product.channel')}</span>
				<span class="flex-1">{$tranFunc('settings.status')}</span>
			</div>
			{#each channels as chan, idx (idx)}
				<div class="flex flex-nowrap mt-1 gap-1">
					<div class="flex-1">{chan.channel}</div>
					<div class="flex-1">
						<Badge
							text={chan.published
								? $tranFunc('product.published')
								: $tranFunc('product.unpublished')}
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
		<div class="text-center text-xs py-3 text-gray-600">
			{$tranFunc('collection.noPrdAssigned')}
		</div>
	{/if}
</div>
