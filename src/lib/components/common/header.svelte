<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { USER_ME_QUERY_STORE } from '$lib/api';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		Heart,
		IonFlame,
		Logout,
		MingcuteHome,
		ShoppingBag,
		UserCog,
	} from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import type { Query, User } from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { wishlistStore } from '$lib/stores/app/wishlist';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { handleLogout } from '$lib/utils/auth.svelte';
	import { ACCESS_TOKEN_KEY, HTTPStatusSuccess } from '$lib/utils/consts';
	import { buildHomePageLink, checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import HeaderSearch from './header-search.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { scale } from 'svelte/transition';

	const SettingButtonText = $derived.by(() => {
		if ($UserStoreManager?.firstName && $UserStoreManager?.lastName) {
			return `${$UserStoreManager.firstName[0]}${$UserStoreManager.lastName[0]}`;
		} else if ($UserStoreManager?.email) {
			return $UserStoreManager.email.slice(0, 2);
		}

		return '';
	});

	// load current user when page load
	onMount(async () => {
		const token = getCookieByKey(ACCESS_TOKEN_KEY);
		if (!token) {
			return;
		}

		const userResult = await GRAPHQL_CLIENT.query<Pick<Query, 'me'>>(
			USER_ME_QUERY_STORE,
			{},
			{ requestPolicy: 'network-only' },
		);

		if (checkIfGraphqlResultHasError(userResult)) {
			return;
		}
		UserStoreManager.setValue(userResult.data?.me as User);
	});

	// load checkout when page load
	onMount(async () => {
		if ($checkoutStore) {
			return;
		}

		const fetchResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
		const parsedResult = await fetchResult.json();

		if (parsedResult.status !== HTTPStatusSuccess) {
			toast.error(parsedResult.message);
			return;
		}

		checkoutStore.set(parsedResult.checkout);
	});

	let loading = $state(false);
	let timeout = $state<ReturnType<typeof setTimeout>>();
	const loadingProgress = new Tween(0, {
		duration: 500,
		easing: cubicOut,
	});

	beforeNavigate(() => {
		loading = true;
		void loadingProgress.set(10);
	});

	afterNavigate(() => {
		void loadingProgress.set(100);
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			loading = false;
			void loadingProgress.set(0);
		}, 500);
	});

	const isAuthPage = $derived(page.url.pathname.startsWith('/auth'));
</script>

<!-- NOTE: the svelte-french-toast lib has z-index of 9999, so please keep every z-indexes of this project lower than 9999 -->

<header class="fixed top-0 left-0 right-0 z-9998 w-full">
	{#if loading}
		<progress
			class="progress h-[3px]! text-brand-500 fixed z-9999 left-0 right-0 top-0"
			value={loadingProgress.current}
			max="100"
		></progress>
	{/if}

	<!-- announcement bar -->
	<div class="bg-brand-700 text-white text-xs sm:text-sm">
		<div
			class="mx-auto max-w-[1350px] px-4 py-1.5 flex items-center justify-center gap-2 font-medium tracking-wide"
		>
			<span class="hidden sm:inline">⚡</span>
			<span class="truncate">{$T('header.announcement')}</span>
		</div>
	</div>

	<!-- main bar -->
	<div
		class="bg-white/85 backdrop-blur-md border-b border-gray-200/70 shadow-xs transition-shadow duration-200"
	>
		<div class="mx-auto max-w-[1350px] px-3 sm:px-4 py-2 flex items-center gap-3 sm:gap-6">
			<!-- logo -->
			<a href={buildHomePageLink()} class="inline select-none! shrink-0" aria-label="Sitename">
				<img src="/logo.png" alt="Sitename logo" class="select-none! w-14 h-auto sm:w-16" />
			</a>

			<!-- search (tablet and up) -->
			<div class="flex-1 max-w-xl hidden tablet:block">
				<HeaderSearch />
			</div>

			<!-- primary nav -->
			<nav class="hidden lg:flex items-center gap-1 shrink-0" aria-label="Primary">
				<a href={buildHomePageLink()}>
					<Button variant="light" size="sm" color="gray" startIcon={MingcuteHome}>
						<span class="max-tablet:hidden!">{$T('pages.home')}</span>
					</Button>
				</a>
				<a href={AppRoute.TRENDING()}>
					<Button variant="light" size="sm" color="gray" startIcon={IonFlame}>
						<span class="max-tablet:hidden!">{$T('pages.trending')}</span>
					</Button>
				</a>
			</nav>

			<!-- actions -->
			<div class="flex items-center gap-2 sm:gap-3.5 ml-auto">
				<a href={AppRoute.WISHLIST()} aria-label={$T('wishlist.title')}>
					<IconButton
						size="sm"
						icon={Heart}
						variant="light"
						color="gray"
						class="relative indicator"
					>
						{#if $wishlistStore.length}
							<span class="indicator-item badge badge-xs text-white! bg-red-500 border-0" in:scale
								>{$wishlistStore.length}</span
							>
						{/if}
					</IconButton>
				</a>
				<a href={AppRoute.SHOPPING_CART()} aria-label={$T('cart.title')}>
					<IconButton
						size="sm"
						icon={ShoppingBag}
						variant="light"
						color="gray"
						class="relative indicator"
					>
						{#key $checkoutStore}
							<span class="indicator-item badge badge-xs text-white! bg-brand-600 border-0" in:scale
								>{$checkoutStore?.lines.length || 0}</span
							>
						{/key}
					</IconButton>
				</a>

				{#if $UserStoreManager}
					{#snippet avatar()}
						<span
							class="rounded-full w-6 h-6 bg-brand-500 text-white flex items-center justify-center font-bold text-xs bg-cover bg-center bg-no-repeat"
							style:background-image={$UserStoreManager.avatar
								? `url(${$UserStoreManager.avatar.url})`
								: undefined}
						>
							{#if !$UserStoreManager.avatar}{SettingButtonText}{/if}
						</span>
					{/snippet}
					<DropDown placement="bottom-end">
						{#snippet trigger({ onclick, onfocus })}
							<Button variant="light" size="sm" color="gray" class="space-x-2" {onclick} {onfocus}>
								{@render avatar()}
								<span class="uppercase max-tablet:hidden">{SettingButtonText}</span>
							</Button>
						{/snippet}
						<MenuItem>
							<div class="flex items-center gap-1.5">
								{@render avatar()}
								<div>
									<div class="font-semibold">
										{`${$UserStoreManager.firstName} ${$UserStoreManager.lastName}`}
									</div>
									<div class="text-xs text-gray-500">{$UserStoreManager.email}</div>
								</div>
							</div>
						</MenuItem>
						<div class="bg-gray-100 my-1 h-px"></div>
						<MenuItem href={AppRoute.ME()} startIcon={UserCog}>
							{$T('common.settings')}
						</MenuItem>
						<MenuItem startIcon={Logout} onclick={() => handleLogout($T)}>
							{$T('common.logout')}
						</MenuItem>
					</DropDown>
				{:else if !isAuthPage}
					<a href={AppRoute.AUTH_SIGNIN()} class="shrink-0">
						<Button variant="filled" size="sm" color="blue">{$T('header.signin')}</Button>
					</a>
				{/if}
			</div>
		</div>

		<!-- mobile search row -->
		<div class="max-tablet:mx-3 max-tablet:mb-2 tablet:hidden">
			<HeaderSearch />
		</div>
	</div>
</header>
