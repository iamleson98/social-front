<script lang="ts">
	import {
		AdjustmentHorizontal,
		BadgeOutline,
		Box,
		BoxOff,
		BuildingWarehouse,
		Category,
		CheckOff,
		Dimension,
		Discount,
		FolderHeart,
		Gift,
		Globe,
		Icon,
		MailQuestion,
		Parking,
		RosetteDiscountChecked,
		Thingiverse,
		Ticket,
		TruckDelivery,
		UserCog,
		UsersGroup,
		type IconContent,
	} from '$lib/components/icons';
	import { onMount, type Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { tranFunc } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import { page } from '$app/state';
	import { classNames, userIsShopAdmin } from '$lib/utils/utils';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';

	type Props = {
		children: Snippet;
		data: LayoutServerData;
	};

	let { children, data }: Props = $props();

	onMount(() => {
		ME_PAGE_USER_STORE.set(data.user);
	});

	let userNameDisplay = $derived.by(() => {
		if ($ME_PAGE_USER_STORE?.firstName && $ME_PAGE_USER_STORE?.lastName) {
			return `${$ME_PAGE_USER_STORE?.firstName} ${$ME_PAGE_USER_STORE?.lastName}`;
		}

		return $ME_PAGE_USER_STORE?.email;
	});

	type TabItem = {
		icon?: IconContent;
		name?: string;
		href: string;
		shouldActive: () => boolean;
	};

	const ACCOUNT_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: UserCog,
			name: $tranFunc('settings.account'),
			href: AppRoute.ME(),
			shouldActive: () => page.url.pathname === AppRoute.ME(),
		},
		{
			icon: AdjustmentHorizontal,
			name: $tranFunc('settings.preference'),
			href: AppRoute.ME_PREFERENCES(),
			shouldActive: () => page.url.pathname === AppRoute.ME_PREFERENCES(),
		},
	]);

	const SHOPPING_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Box,
			name: $tranFunc('settings.myOrders'),
			href: AppRoute.MY_ORDERS(),
			shouldActive: () => page.url.pathname === AppRoute.MY_ORDERS(),
		},
		{
			icon: MailQuestion,
			name: $tranFunc('settings.supports'),
			href: AppRoute.ME_SUPPORT(),
			shouldActive: () => page.url.pathname === AppRoute.ME_SUPPORT(),
		},
	]);

	const SHOP_ORDERS_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Box,
			name: $tranFunc('settings.orders'),
			href: AppRoute.SETTINGS_ORDERS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_ORDERS(),
					AppRoute.SETTINGS_ORDERS_NEW(),
					AppRoute.SETTINGS_ORDERS_DETAILS(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: BoxOff,
			name: 'Draft orders',
			href: AppRoute.SETTINGS_SHOP_DRAFT_ORDERS(),
			shouldActive: () => page.url.pathname === AppRoute.SETTINGS_SHOP_DRAFT_ORDERS(),
		},
	]);

	const CATALOG_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Parking,
			name: $tranFunc('product.products'),
			href: AppRoute.SETTINGS_PRODUCTS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_PRODUCTS(),
					AppRoute.SETTINGS_PRODUCTS_NEW(),
					AppRoute.SETTINGS_PRODUCTS_EDIT(page.params.slug),
				].includes(page.url.pathname),
		},
		{
			icon: Category,
			name: 'Categories',
			href: AppRoute.SETTINGS_CONFIGS_CATEGORIES(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_CATEGORIES(),
					AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(page.params.id),
					AppRoute.SETTINGS_CONFIGS_CATEGORY_NEW(),
				].includes(page.url.pathname),
		},
		{
			name: 'Collections',
			href: AppRoute.SETTINGS_CONFIGS_COLLECTIONS(),
			icon: FolderHeart,
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_COLLECTIONS(),
					AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(page.params.id),
					AppRoute.SETTINGS_CONFIGS_COLLECTION_NEW(),
				].includes(page.url.pathname),
		},
		{
			name: 'Giftcards',
			href: AppRoute.SETTINGS_CONFIGS_GIFTCARDS(),
			icon: Gift,
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_GIFTCARDS(),
					AppRoute.SETTINGS_CONFIGS_GIFTCARD_DETAIL(page.params.id),
					AppRoute.SETTINGS_CONFIGS_GIFTCARD_NEW(),
				].includes(page.url.pathname),
		},
	]);

	const SHOP_DISCOUNTS_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Discount,
			name: 'Promotions',
			href: AppRoute.SETTINGS_CONFIGS_PROMOTIONS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_PROMOTIONS(),
					AppRoute.SETTINGS_CONFIGS_PROMOTION_NEW(),
					AppRoute.SETTINGS_CONFIGS_PROMOTION_DETAIL(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: Ticket,
			name: 'Vouchers',
			href: AppRoute.SETTINGS_CONFIGS_VOUCHERS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_VOUCHERS(),
					AppRoute.SETTINGS_CONFIGS_VOUCHER_NEW(),
					AppRoute.SETTINGS_CONFIGS_VOUCHER_DETAIL(page.params.id),
				].includes(page.url.pathname),
		},
	]);

	const SHOP_CONFIG_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Globe,
			name: $tranFunc('product.channel'),
			href: AppRoute.SETTINGS_CONFIGS_CHANNELS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_CHANNELS(),
					AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW(),
					AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(page.params.slug),
				].includes(page.url.pathname),
		},
		{
			icon: Thingiverse,
			name: 'Product types',
			href: AppRoute.SETTINGS_PRODUCT_TYPES(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_PRODUCT_TYPES(),
					AppRoute.SETTINGS_PRODUCT_TYPE_NEW(),
					AppRoute.SETTINGS_PRODUCT_TYPE_EDIT(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: BadgeOutline,
			name: $tranFunc('settings.staffs'),
			href: AppRoute.SETTINGS_CONFIGS_STAFFS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_STAFFS(),
					AppRoute.SETTINGS_CONFIGS_STAFF_NEW(),
					AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: UsersGroup,
			name: $tranFunc('settings.users'),
			href: AppRoute.SETTINGS_CONFIGS_USERS(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_USERS(),
					AppRoute.SETTINGS_CONFIGS_USER_NEW(),
					AppRoute.SETTINGS_CONFIGS_USER_DETAILS(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: BuildingWarehouse,
			name: 'Warehouses',
			href: AppRoute.SETTINGS_CONFIGS_WAREHOUSES(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_WAREHOUSES(),
					AppRoute.SETTINGS_CONFIGS_WAREHOUSE_NEW(),
					AppRoute.SETTINGS_CONFIGS_WAREHOUSE_DETAILS(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: Dimension,
			name: 'Attributes',
			href: AppRoute.SETTINGS_CONFIGS_ATTRIBUTES(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_ATTRIBUTES(),
					AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_NEW(),
					AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(page.params.id),
				].includes(page.url.pathname),
		},
		{
			icon: TruckDelivery,
			name: 'Shipping zones',
			href: AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES(),
			shouldActive: () =>
				[
					AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES(),
					AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_NEW(),
					AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id),
				].includes(page.url.pathname),
		},
	]);
</script>

{#snippet sidebarItem(item: TabItem)}
	{@const attrs = item.href ? { href: item.href } : {}}
	{@const active = item.href == page.url.pathname || item.shouldActive()}
	<svelte:element
		this={item.href ? 'a' : 'div'}
		{...attrs}
		class={classNames(
			'flex items-center gap-2 rounded-md p-2 py-2.5 hover:bg-blue-100 hover:text-blue-700 cursor-pointer relative',
			{
				[`bg-blue-100 text-blue-700 font-semibold before:content-[" "] before:h-full before:w-2 before:rounded-sm before:bg-blue-500 before:absolute before:right-[calc(100%+4px)]`]:
					!!active,
			},
		)}
	>
		{#if item.icon}
			<Icon icon={item.icon} />
		{/if}
		<span>{item.name}</span>
	</svelte:element>
{/snippet}

{#if !$ME_PAGE_USER_STORE}
	<SkeletonContainer>
		<Skeleton class="w-full h-6" />
	</SkeletonContainer>
{:else}
	<!-- MARK: Detail -->
	<div class="flex flex-nowrap gap-2">
		<div class="w-1/4 sticky top-16 h-full p-2 space-y-2">
			<!-- MARK: Avatar -->
			<div class="flex items-start gap-2 text-gray-700 p-3">
				<div class="rounded-full h-16 w-16 overflow-hidden">
					<img
						src={$ME_PAGE_USER_STORE?.avatar?.url}
						alt={$ME_PAGE_USER_STORE?.avatar?.alt}
						class="h-full w-full"
					/>
				</div>
				<div>
					<div class="text-lg font-semibold">
						{userNameDisplay}
					</div>
					<div class="flex items-center gap-1">
						{#if $ME_PAGE_USER_STORE?.isConfirmed}
							<Icon icon={RosetteDiscountChecked} class="text-blue-500" size="md" />
							<span class="text-sm text-gray-500">Verified</span>
						{:else}
							<Icon icon={CheckOff} class="text-red-500" size="md" />
							<span class="text-sm text-gray-500">Unverified</span>
						{/if}
					</div>
				</div>
			</div>

			<AccordionList
				header={$tranFunc('settings.account')}
				child={sidebarItem}
				items={ACCOUNT_TAB_ITEMS}
				class="w-full p-3"
				open={ACCOUNT_TAB_ITEMS.some((item) => item.shouldActive())}
			/>

			<AccordionList
				header={$tranFunc('settings.shopping')}
				child={sidebarItem}
				items={SHOPPING_TAB_ITEMS}
				class="w-full p-3"
				open={SHOPPING_TAB_ITEMS.some((item) => item.shouldActive())}
			/>

			{#if $READ_ONLY_USER_STORE && userIsShopAdmin($READ_ONLY_USER_STORE)}
				<AccordionList
					header="Catalog"
					child={sidebarItem}
					items={CATALOG_TAB_ITEMS}
					class="w-full p-3"
					open={CATALOG_TAB_ITEMS.some((item) => item.shouldActive())}
				/>

				<AccordionList
					header="Fulfillments"
					child={sidebarItem}
					items={SHOP_ORDERS_TAB_ITEMS}
					class="w-full p-3"
					open={SHOP_ORDERS_TAB_ITEMS.some((item) => item.shouldActive())}
				/>

				<AccordionList
					header="Discounts"
					child={sidebarItem}
					items={SHOP_DISCOUNTS_TAB_ITEMS}
					class="w-full p-3"
					open={SHOP_DISCOUNTS_TAB_ITEMS.some((item) => item.shouldActive())}
				/>

				<AccordionList
					header="Configurations"
					child={sidebarItem}
					items={SHOP_CONFIG_TAB_ITEMS}
					class="w-full p-3"
					open={SHOP_CONFIG_TAB_ITEMS.some((item) => item.shouldActive())}
				/>
			{/if}
		</div>

		<div class="w-3/4">
			{@render children()}
		</div>
	</div>
{/if}
