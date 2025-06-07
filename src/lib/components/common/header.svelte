<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { page } from '$app/state';
	import { checkoutStore } from '$lib/stores/app';
	import {
		Icon,
		IonFlame,
		Logout,
		MingcuteHome,
		Search,
		ShoppingBag,
		UserCog,
	} from '$lib/components/icons';
	import { scale } from 'svelte/transition';
	import { Input } from '$lib/components/ui/Input';
	import { IconButton } from '$lib/components/ui/Button';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { USER_ME_QUERY_STORE } from '$lib/api';
	import type { Query, User } from '$lib/gql/graphql';
	import { buildHomePageLink, checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { tranFunc } from '$i18n';
	import { onMount } from 'svelte';
	import { ACCESS_TOKEN_KEY, HTTPStatusSuccess } from '$lib/utils/consts';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { READ_ONLY_USER_STORE, setUserStoreValue } from '$lib/stores/auth/user';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { toast } from 'svelte-sonner';
	import { handleLogout } from '$lib/utils/auth.svelte';

	const { userDisplayName } = $derived.by(() => {
		let userDisplayName;

		if ($READ_ONLY_USER_STORE?.firstName && $READ_ONLY_USER_STORE.lastName)
			userDisplayName = `${$READ_ONLY_USER_STORE.firstName[0]}${$READ_ONLY_USER_STORE.lastName[0]}`;
		else if ($READ_ONLY_USER_STORE?.email)
			userDisplayName = $READ_ONLY_USER_STORE.email.slice(0, 2);

		return { userDisplayName };
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
		setUserStoreValue(userResult.data?.me as User);
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

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-xs z-200 w-full">
	{#if loading}
		<progress
			class="progress h-[3px]! text-blue-400 fixed z-210 left-0 right-0 top-0"
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
			<label class="input flex items-center gap-2 input-sm">
				<Input placeholder="type something" size="sm" />
				<span>
					<Icon icon={Search} />
				</span>
			</label>
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
			{#if $READ_ONLY_USER_STORE}
				{#snippet trigger({ onclick, onfocus }: DropdownTriggerInterface)}
					<Button variant="light" size="sm" class="space-x-2 uppercase" {onclick} {onfocus}>
						{#if $READ_ONLY_USER_STORE.avatar}
							<span
								class="rounded-full w-5 h-5 bg-blue-300 flex items-center justify-center font-bold bg-cover bg-center bg-no-repeat"
								style="background-image: url({$READ_ONLY_USER_STORE.avatar.url});"
							>
							</span>
						{/if}
						<span>{userDisplayName}</span>
					</Button>
				{/snippet}

				<DropDown
					{trigger}
					placement="bottom-end"
					noReCalculateOnWindowResize
					options={[
						{
							children: $tranFunc('common.settings'),
							href: AppRoute.ME(),
							startIcon: UserCog,
						},
						{
							children: $tranFunc('common.logout'),
							onclick: () => handleLogout($tranFunc),
							startIcon: Logout,
						},
					]}
				/>
			{:else if !$READ_ONLY_USER_STORE && !page.url.pathname.startsWith('/auth')}
				<a href={AppRoute.AUTH_SIGNIN()}>
					<Button variant="filled" size="sm">{$tranFunc('signin.title')}</Button>
				</a>
			{/if}
		</div>
	</div>
</header>
