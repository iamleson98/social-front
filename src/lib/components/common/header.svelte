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
		UserCog
	} from '$lib/components/icons';
	import { scale } from 'svelte/transition';
	import { Input } from '../ui/Input';
	import { IconButton } from '../ui/Button';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { USER_ME_QUERY_STORE } from '$lib/api';
	import type { Query, User } from '$lib/gql/graphql';
	import { buildHomePageLink, preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { tranFunc } from '$i18n';
	import { onMount, tick } from 'svelte';
	import { ACCESS_TOKEN_KEY, HTTPStatusSuccess } from '$lib/utils/consts';
	import { toastStore } from '$lib/stores/ui/toast';
	import { afterNavigate, beforeNavigate, invalidateAll } from '$app/navigation';
	import { DropDown, type DropdownTriggerInterface } from '../ui/Dropdown';
	import { READ_ONLY_USER_STORE, setUserStoreValue } from '$lib/stores/auth/user';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

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
			{ requestPolicy: 'network-only' }
		).toPromise();

		if (preHandleErrorOnGraphqlResult(userResult)) return;
		setUserStoreValue(userResult.data?.me as User);
	});

	const handleLogout = async () => {
		const result = await fetch(AppRoute.AUTH_SIGNOUT(), { method: 'POST' });
		const parsedResult = await result.json();

		if (parsedResult.status !== HTTPStatusSuccess) {
			toastStore.send({
				variant: 'error',
				message: $tranFunc('error.errorOccured')
			});
			return;
		}

		setUserStoreValue(null);
		await invalidateAll();
	};

	// load checkout when page load
	onMount(async () => {
		if ($checkoutStore) return;

		const fetchResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
		const parsedResult = await fetchResult.json();

		if (parsedResult.status !== HTTPStatusSuccess) {
			toastStore.send({
				variant: 'error',
				message: parsedResult.message
			});
			return;
		}

		checkoutStore.set(parsedResult.checkout);
	});

	let loading = $state(false);
	const loadingProgress = tweened(0, {
		duration: 500,
		easing: cubicOut
	});

	beforeNavigate(async () => {
		loading = true;
		loadingProgress.set(10);
	});

	afterNavigate(async () => {
		loadingProgress.set(100);
		setTimeout(() => {
			loading = false;
			loadingProgress.set(0);
		}, 500);
	});
</script>

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-xs z-200 w-full">
	{#if loading}
		<progress
			class="progress h-[3px]! text-blue-400 fixed z-210 left-0 right-0 top-0"
			value={$loadingProgress}
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
					<span>{$tranFunc('pages.home')}</span>
				</Button>
			</a>
			<a href={AppRoute.TRENDING()}>
				<Button variant="light" size="sm" startIcon={IonFlame}>
					<span>{$tranFunc('pages.trending')}</span>
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
							startIcon: UserCog
						},
						{ children: $tranFunc('common.logout'), onclick: handleLogout, startIcon: Logout }
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
