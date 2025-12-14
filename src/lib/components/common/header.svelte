<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { USER_ME_QUERY_STORE } from '$lib/api';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		IonFlame,
		Logout,
		MingcuteHome,
		Search,
		ShoppingBag,
		UserCog,
	} from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Input } from '$lib/components/ui/Input';
	import type { Query, User } from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { handleLogout } from '$lib/utils/auth.svelte';
	import { ACCESS_TOKEN_KEY, HTTPStatusSuccess } from '$lib/utils/consts';
	import { buildHomePageLink, checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { scale } from 'svelte/transition';

	const SettingButtonText = $derived.by(() => {
		if ($UserStoreManager?.firstName && $UserStoreManager?.lastName)
			return `${$UserStoreManager.firstName[0]}${$UserStoreManager.lastName[0]}`;
		else if ($UserStoreManager?.email) return $UserStoreManager.email.slice(0, 2);

		return '';
	});

	// load current user when page load
	onMount(async () => {
		const token = getCookieByKey(ACCESS_TOKEN_KEY);
		if (!token) return;

		const userResult = await GRAPHQL_CLIENT.query<Pick<Query, 'me'>>(
			USER_ME_QUERY_STORE,
			{},
			{ requestPolicy: 'network-only' },
		);

		if (checkIfGraphqlResultHasError(userResult)) return;
		UserStoreManager.setValue(userResult.data?.me as User);
	});

	// load checkout when page load
	onMount(async () => {
		if ($checkoutStore) return;

		const fetchResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
		const parsedResult = await fetchResult.json();

		if (parsedResult.status !== HTTPStatusSuccess) {
			toast.error(parsedResult.message);
			return;
		}

		checkoutStore.set(parsedResult.checkout);
	});

	let loading = $state(false);
	let timeout = $state<NodeJS.Timeout>();
	const loadingProgress = new Tween(0, {
		duration: 500,
		easing: cubicOut,
	});

	beforeNavigate(() => {
		loading = true;
		loadingProgress.set(10);
	});

	afterNavigate(() => {
		loadingProgress.set(100);
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			loading = false;
			loadingProgress.set(0);
		}, 500);
	});
</script>

<!-- NOTE: the svelte-french-toast lib has z-index of 9999, so please keep every z-indexes of this project lower than 9999 -->

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-xs z-9998 w-full">
	{#if loading}
		<progress
			class="progress h-[3px]! text-blue-400 fixed z-9999 left-0 right-0 top-0"
			value={loadingProgress.current}
			max="100"
		></progress>
	{/if}
	<!-- navigating -->
	<div class="w-1/2 flex items-center gap-3">
		<!-- logo -->
		<a href={buildHomePageLink()} class="inline select-none!">
			<img src="/logo.png" alt="logo" class="select-none! w-16 h-auto" />
		</a>

		<!-- search -->
		<div>
			<Input placeholder={$tranFunc('common.search')} startIcon={Search} size="sm" />
		</div>
	</div>
	<div class="w-1/2 flex justify-between">
		<div class="flex gap-1">
			<a href={buildHomePageLink()}>
				<Button variant="light" size="sm" startIcon={MingcuteHome}>
					<span class="tablet:hidden!">{$tranFunc('pages.home')}</span>
				</Button>
			</a>
			<a href={AppRoute.TRENDING()}>
				<Button variant="light" size="sm" startIcon={IonFlame}>
					<span class="tablet:hidden!">{$tranFunc('pages.trending')}</span>
				</Button>
			</a>
		</div>

		<div class="flex items-center gap-3.5">
			<a href={AppRoute.SHOPPING_CART()}>
				<IconButton
					size="sm"
					icon={ShoppingBag}
					variant="light"
					color="gray"
					class="relative indicator"
				>
					{#key $checkoutStore}
						<span class="indicator-item badge badge-xs text-white! bg-blue-500" in:scale>
							{$checkoutStore?.lines.length || 0}
						</span>
					{/key}
				</IconButton>
			</a>
			{#if $UserStoreManager}
				{#snippet avatar()}
					<span
						class="rounded-full w-6 h-6 bg-blue-300 flex items-center justify-center font-bold bg-cover bg-center bg-no-repeat"
						style:background-image={$UserStoreManager.avatar
							? `url(${$UserStoreManager.avatar.url})`
							: 'bg-blue-300'}
					>
					</span>
				{/snippet}
				<DropDown placement="bottom-end">
					{#snippet trigger({ onclick, onfocus })}
						<Button variant="light" size="sm" class="space-x-2 uppercase" {onclick} {onfocus}>
							{@render avatar()}
							<span>{SettingButtonText}</span>
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
					<div class="bg-gray-200 my-1 h-px"></div>
					<MenuItem href={AppRoute.ME()} startIcon={UserCog}>
						{$tranFunc('common.settings')}
					</MenuItem>
					<MenuItem href={AppRoute.ME()} startIcon={Logout} onclick={() => handleLogout($tranFunc)}>
						{$tranFunc('common.logout')}
					</MenuItem>
				</DropDown>
			{:else if !$UserStoreManager && !page.url.pathname.startsWith('/auth')}
				<a href={AppRoute.AUTH_SIGNIN()}>
					<Button variant="filled" size="sm">{$tranFunc('signin.title')}</Button>
				</a>
			{/if}
		</div>
	</div>
</header>
