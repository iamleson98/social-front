<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { userStore } from '$lib/stores/auth';
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
	import { graphqlClient } from '$lib/client';
	import { USER_ME_QUERY_STORE } from '$lib/stores/api';
	import type { Query } from '$lib/gql/graphql';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { tClient } from '$i18n';
	import { onMount } from 'svelte';
	import { ACCESS_TOKEN_KEY, HTTPStatusSuccess } from '$lib/utils/consts';
	import { toastStore } from '$lib/stores/ui/toast';
	import { invalidateAll } from '$app/navigation';

	const { userDisplayName } = $derived.by(() => {
		let userDisplayName;

		if ($userStore?.firstName && $userStore.lastName)
			userDisplayName = `${$userStore.firstName[0]}${$userStore.lastName[0]}`;
		else if ($userStore?.email) userDisplayName = $userStore.email.slice(0, 2);

		return { userDisplayName };
	});

	// load current user when oage load
	onMount(async () => {
		const token = getCookieByKey(ACCESS_TOKEN_KEY);
		if (!token) return;

		const userResult = await graphqlClient
			.query<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, { requestPolicy: 'network-only' })
			.toPromise();

		if (preHandleErrorOnGraphqlResult(userResult)) return;
		userStore.set(userResult.data?.me);
	});

	const handleLogout = async () => {
		const result = await fetch(AppRoute.AUTH_SIGNOUT, { method: 'POST' });
		const parsedResult = await result.json();

		if (parsedResult.status !== HTTPStatusSuccess) {
			toastStore.send({
				variant: 'error',
				message: tClient('error.failedToSignout')
			});
			return;
		}

		userStore.set(null);
		await invalidateAll();
	};

	// load checkout when page load
	onMount(async () => {
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
</script>

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-xs z-40 w-full">
	<!-- navigating -->
	<div class="w-1/2 flex items-center gap-3">
		<!-- logo -->
		<a href={AppRoute.HOME} class="inline select-none!">
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
			<a href={AppRoute.HOME}>
				<Button variant="light" size="sm" startIcon={MingcuteHome}>
					<span>Home</span>
				</Button>
			</a>
			<a href={AppRoute.TRENDING}>
				<Button variant="light" size="sm" startIcon={IonFlame}>
					<span>Trending</span>
				</Button>
			</a>
		</div>

		<div class="flex items-center gap-3.5">
			<a href={AppRoute.SHOPPING_CART}>
				<IconButton size="sm" icon={ShoppingBag} variant="light" color="gray" class="relative">
					{#key $checkoutStore}
						<span class="absolute -right-1/4 -top-1/4 z-99999999 !text-[10px] flex h-4 min-w-4 items-center text-xs justify-center rounded-full bg-blue-500 p-1 font-bold text-white" in:scale>
							{$checkoutStore?.lines.length || 0}
						</span>
					{/key}
				</IconButton>
			</a>
			{#if $userStore}
				<div class="dropdown dropdown-end">
					<Button variant="light" size="sm" class="space-x-2 uppercase">
						{#if $userStore.avatar}
							<span
								class="rounded-full w-5 h-5 bg-blue-300 flex items-center justify-center font-bold bg-cover bg-center bg-no-repeat"
								style="background-image: url({$userStore.avatar.url});"
							>
							</span>
						{/if}
						<span>{userDisplayName}</span>
					</Button>

					<ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-48 p-1 mt-1 shadow-sm">
						<li>
							<span
								tabindex="0"
								onclick={console.log}
								onkeyup={(e) => e.key === 'Enter' && console.log('')}
								class="flex items-center gap-2"
								role="button"
							>
								<Icon icon={UserCog} />
								<span>{tClient('common.settings')}</span>
							</span>
						</li>
						<li>
							<span
								onclick={handleLogout}
								tabindex="0"
								onkeyup={(e) => e.key === 'Enter' && handleLogout()}
								class="flex items-center gap-2"
								role="button"
							>
								<Icon icon={Logout} />
								<span>{tClient('common.logout')}</span>
							</span>
						</li>
					</ul>
				</div>
			{:else if !$userStore && !page.url.pathname.startsWith('/auth')}
				<a href={AppRoute.AUTH_SIGNIN}>
					<Button variant="filled" size="sm">{tClient('signin.title')}</Button>
				</a>
			{/if}
		</div>
	</div>
</header>
