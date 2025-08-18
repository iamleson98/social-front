<script lang="ts">
	import {
		ArrowDown,
		ArrowUp,
		Category,
		FilterCog,
		RosetteDiscountChecked,
		Search,
	} from '$lib/components/icons';
	import { type Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { page } from '$app/state';
	import { AppRoute } from '$lib/utils';
	import Icon from '$lib/components/icons/icon.svelte';
	import { flipDirection, SitenameCommonClassName } from '$lib/utils/utils';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import {
		OrderDirection,
		ProductOrderField,
		type CategoryCountableEdge,
		type Query,
	} from '$lib/gql/graphql';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import { operationStore } from '$lib/api/operation';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Select } from '$lib/components/ui/select';
	import { ProductSortFields } from '$lib/components/pages/home/common';
	import { IconButton } from '$lib/components/ui/Button';

	interface Props {
		data: LayoutServerData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const ChannelsQuery = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});
	let sortField = $state<ProductOrderField>();
	let orderDirection = $state<OrderDirection>(OrderDirection.Asc);

	// const Tabs = $derived([
	// 	{
	// 		title: $tranFunc('product.products'),
	// 		icon: Box,
	// 		href: `${AppRoute.CATEGORY_DETAILS(page.params.slug as string)}`,
	// 	},
	// {
	// 	title: `${$tranFunc('product.subCategories')} (${data.category?.children?.totalCount || ''})`,
	// 	icon: CategoryPlus,
	// 	href: `${AppRoute.SUB_CATEGORIES(page.params.slug as string)}`,
	// },
	// {
	// 	title: $tranFunc('product.detail'),
	// 	icon: InforCircle,
	// 	href: `${AppRoute.CATEGORY_INFO(page.params.slug as string)}`,
	// },
	// ]);
</script>

<div class="flex gap-2">
	<!-- sidebar -->
	<div class="w-1/4 tablet:w-full space-y-2 sticky h-fit top-16">
		<div class={SitenameCommonClassName}>
			<div
				class="h-66 mb-4 w-66 mx-auto rounded-sm bg-cover bg-center bg-no-repeat"
				style={`background-image: url(${data.category?.backgroundImage?.url});`}
			></div>

			<div class="text-gray-700">
				<div class="font-semibold">
					{data.category?.name}
				</div>
				<div class="flex items-center gap-1">
					<Icon icon={RosetteDiscountChecked} class="text-green-600" size="md" />
					<div class="text-xs text-gray-600">Official</div>
				</div>
			</div>
		</div>

		<AccordionList
			header="Sub categories"
			headerIcon={Category}
			items={data.category?.children?.edges || []}
			partialDisplay={5}
			class="mb-2 p-3"
		>
			{#snippet child({ node }: CategoryCountableEdge)}
				<a
					href={`${AppRoute.CATEGORY_DETAILS(node.slug)}`}
					class="block p-2 rounded-md bg-white border border-gray-200 break-all"
				>
					<div class="flex items-center gap-2">
						<img
							src={node.backgroundImage?.url}
							alt={node.backgroundImage?.alt || node.name}
							class="rounded-md h-6 w-6"
						/>
						<span>{node.name}</span>
					</div>
				</a>
			{/snippet}
		</AccordionList>
	</div>

	<!-- tabs -->
	<div class="w-3/4 tablet:w-full space-y-2">
		<!-- <div role="tablist" class="tabs tabs-border tabs-sm mb-4">
			{#each Tabs as tab, idx (idx)}
				<a role="tab" class="tab" class:tab-active={page.url.pathname === tab.href} href={tab.href}>
					{#if tab.icon}
						<Icon icon={tab.icon} class="mr-1.5" />
					{/if}
					<span>{tab.title}</span>
				</a>
			{/each}
		</div> -->

		<!-- Filter Bar -->
		{#if $ChannelsQuery.fetching}
			<!-- <TableSkeleton numOfRows={1} numColumns={4} /> -->
			<SkeletonContainer class="flex items-center gap-4 p-3! rounded-lg!">
				<Skeleton class="w-1/3 h-5" />
				<Skeleton class="w-1/3 h-5" />
			</SkeletonContainer>
		{:else if $ChannelsQuery.error}
			<Alert size="xs" variant="error">{$ChannelsQuery.error.message}</Alert>
		{:else}
			{@const activeChannel = $ChannelsQuery.data?.channels?.find(
				(chan) => chan.slug === page.params.channel,
			)}
			{#snippet action()}
				<span class="text-[10px] font-semibold text-gray-600">
					{activeChannel ? activeChannel.currencyCode : 'VND'}
				</span>
			{/snippet}
			<div
				class="flex items-center gap-2 sticky h-fit top-16 bg-white rounded-lg border border-gray-200 p-2 shadow-xs"
			>
				<Icon icon={FilterCog} size="md" class="text-gray-500" />
				<div class="h-6 w-[2px] rounded-full bg-gray-300"></div>
				<DropDown>
					{#snippet trigger({ onclick }: DropdownTriggerInterface)}
						<div>
							<!-- <Label size="xs" label="Sub category" /> -->
							<Button size="xs" variant="outline" color="gray" {onclick}>Select sub category</Button
							>
						</div>
					{/snippet}
					<div class="rounded-lg py-0.5">
						{#each data.category?.children?.edges || [] as edge, idx (idx)}
							<div
								role="menuitem"
								class="flex items-center cursor-pointer gap-2 py-1 px-1.5 text-sm transition-colors hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-100 duration-150"
							>
								<img
									src={edge.node.backgroundImage?.url}
									alt={edge.node.backgroundImage?.alt || edge.node.name}
									class="rounded-md border border-gray-200 h-7 w-7"
								/>
								<span>{edge.node.name}</span>
							</div>
						{/each}
					</div>
				</DropDown>

				<div class="flex items-center gap-1">
					<div class="text-xs font-semibold text-gray-600">Price</div>
					<Input size="xs" placeholder="from" type="number" class="max-w-30" min={0} {action} />
					<span>-</span>
					<Input size="xs" placeholder="to" type="number" class="max-w-30" min={0} {action} />
				</div>

				<dir class="flex items-center gap-1">
					<Select
						options={$ProductSortFields}
						placeholder="Sort field"
						class="max-w-30"
						size="xs"
						bind:value={sortField}
					/>
					<IconButton
						icon={orderDirection === OrderDirection.Asc ? ArrowDown : ArrowUp}
						size="xs"
						color="gray"
						onclick={() => (orderDirection = flipDirection(orderDirection))}
					/>
				</dir>

				<Button startIcon={Search} size="xs">Search</Button>
			</div>
		{/if}

		<div class={SitenameCommonClassName}>
			{@render children()}
		</div>

		<!-- <div class="h-[1000px]"></div> -->
	</div>
</div>
