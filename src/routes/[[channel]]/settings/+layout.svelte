<script lang="ts">
	import {
		AdjustmentHorizontal,
		Box,
		CheckOff,
		Icon,
		MailQuestion,
		Order,
		Parking,
		RosetteDiscountChecked,
		SettingCog,
		UserCog,
		type IconContent
	} from '$lib/components/icons';
	import { onMount, type Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { tranFunc } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import { page } from '$app/state';
	import { userIsShopAdmin } from '$lib/utils/utils';
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
		shouldActive?: () => boolean;
	};

	const ACCOUNT_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: UserCog,
			name: $tranFunc('settings.account'),
			href: AppRoute.ME()
		},
		{
			icon: AdjustmentHorizontal,
			name: $tranFunc('settings.preference'),
			href: AppRoute.ME_PREFERENCES()
		}
	]);

	const SHOPPING_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Box,
			name: $tranFunc('settings.myOrders'),
			href: AppRoute.MY_ORDERS()
		},
		{
			icon: MailQuestion,
			name: $tranFunc('settings.supports'),
			href: AppRoute.ME_SUPPORT(),
			shouldActive: () =>
				page.url.pathname === AppRoute.ME_SUPPORT_NEW() ||
				page.route.id === '/[[channel]]/settings/supports/[id]'
		}
	]);

	const SHOP_TAB_ITEMS: TabItem[] = $derived([
		{
			icon: Box,
			name: $tranFunc('settings.orders'),
			href: AppRoute.SETTINGS_ORDERS(),
			shouldActive: () => page.url.pathname.startsWith(AppRoute.SETTINGS_ORDERS())
		},
		{
			icon: Parking,
			name: $tranFunc('product.products'),
			href: AppRoute.SETTINGS_PRODUCTS(),
			shouldActive: () =>
				page.url.pathname === AppRoute.SETTINGS_PRODUCTS_NEW() ||
				page.route.id === '/[[channel]]/settings/products/[slug]'
		},
		{
			icon: Order,
			name: $tranFunc('settings.contracts'),
			href: AppRoute.SETTINGS_CONTRACTS(),
			shouldActive: () => page.url.pathname === AppRoute.SETTINGS_CONTRACTS_NEW()
		},
		{
			icon: SettingCog,
			name: $tranFunc('settings.configs'),
			href: AppRoute.SETTINGS_CONFIGS(),
			shouldActive: () =>
				// page.url.pathname === AppRoute.SETTINGS_CONFIGS_CHANNELS() ||
				// page.url.pathname === AppRoute.SETTINGS_CONFIGS_STAFFS() ||
				// page.url.pathname === AppRoute.SETTINGS_CONFIGS_USERS() ||
				// page.route.id === '/[[channel]]/settings/configs/channels/[id]' ||
				// page.route.id === '/[[channel]]/settings/configs/staffs/[id]' ||
				// page.route.id === '/[[channel]]/settings/configs/customers/[id]'
				page.url.pathname.startsWith(AppRoute.SETTINGS_CONFIGS())
		}
	]);
</script>

{#snippet sidebarItem(item: TabItem)}
	{@const attrs = item.href ? { href: item.href } : {}}
	{@const active = item.href == page.url.pathname || item.shouldActive?.()}
	<svelte:element
		this={item.href ? 'a' : 'div'}
		{...attrs}
		class="flex items-center gap-2 rounded-md p-2 py-2.5 {active
			? 'bg-blue-100 text-blue-700 font-semibold before:content-[" "] before:h-full before:w-2 before:rounded-sm before:bg-blue-500 before:absolute before:right-[calc(100%+4px)]'
			: ''} hover:bg-blue-100 hover:text-blue-700 cursor-pointer relative"
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
	<div class="flex flex-nowrap mt-5 gap-2">
		<div class="w-1/4 sticky top-16 h-[calc(100vh-4rem)] p-2">
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
							<Icon icon={RosetteDiscountChecked} class="text-blue-500 h-6 w-6" />
							<span class="text-sm text-gray-500">Verified</span>
						{:else}
							<Icon icon={CheckOff} class="text-red-500 h-6 w-6" />
							<span class="text-sm text-gray-500">Unverified</span>
						{/if}
					</div>
				</div>
			</div>

			<AccordionList
				header={$tranFunc('settings.account')}
				child={sidebarItem}
				items={ACCOUNT_TAB_ITEMS}
				class="w-full"
			/>

			<AccordionList
				header={$tranFunc('settings.shopping')}
				child={sidebarItem}
				items={SHOPPING_TAB_ITEMS}
				class="w-full"
			/>

			{#if !!$READ_ONLY_USER_STORE && userIsShopAdmin($READ_ONLY_USER_STORE)}
				<AccordionList
					header={$tranFunc('settings.shopManage')}
					child={sidebarItem}
					items={SHOP_TAB_ITEMS}
					class="w-full"
				/>
			{/if}
		</div>

		<div class="w-3/4">
			{@render children()}
		</div>
	</div>
{/if}
