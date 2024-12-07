<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { page } from '$app/stores';
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
	import { DropDown } from '../ui/Dropdown';
	import { graphqlClient } from '$lib/client';
	import { USER_ME_QUERY_STORE } from '$lib/stores/api';
	import type { Query } from '$lib/gql/graphql';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { tClient } from '$i18n';
	import { onMount } from 'svelte';
	import { ACCESS_TOKEN_KEY, HTTPStatusSuccess } from '$lib/utils/consts';
	import { toastStore } from '$lib/stores/ui/toast';
	import { invalidateAll } from '$app/navigation';

	let openUserDropdown = $state(false);
	let dropdownTriggerRef = $state<HTMLButtonElement>();

	const { userAvatarStyle, userDisplayName } = $derived.by(() => {
		let userAvatarStyle, userDisplayName;

		if ($userStore?.avatar?.url) {
			userAvatarStyle = `background-image: url("${$userStore.avatar.url}")`;
		}
		if ($userStore?.firstName && $userStore.lastName)
			userDisplayName = `${$userStore.firstName[0]}${$userStore.lastName[0]}`;
		else if ($userStore?.email) userDisplayName = $userStore.email.slice(0, 2);

		return { userAvatarStyle, userDisplayName };
	});

	onMount(async () => {
		const token = getCookieByKey(ACCESS_TOKEN_KEY);
		if (!token) return;

		const userResult = await graphqlClient
			.query<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, { requestPolicy: 'network-only' })
			.toPromise();

		if (preHandleGraphqlResult(userResult)) return;
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
</script>

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-sm z-[40] w-full">
	<!-- navigating -->
	<div class="w-1/2 flex items-center gap-3">
		<!-- logo -->
		<a href={AppRoute.HOME} class="inline !select-none">
			<img src="/logo.png" alt="logo" class="!select-none w-16 h-auto" />
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
						<span class="cart-quantity" in:scale>
							{$checkoutStore?.lines.length || 0}
						</span>
					{/key}
				</IconButton>
			</a>
			{#if $userStore}
				<Button
					variant="light"
					size="sm"
					bind:ref={dropdownTriggerRef}
					class="space-x-2 uppercase"
					onclick={() => (openUserDropdown = true)}
				>
					{#if $userStore.avatar}
						<span
							class="rounded-full w-5 h-5 bg-blue-300 flex items-center justify-center font-bold bg-cover bg-center bg-no-repeat"
							style={userAvatarStyle}
						>
						</span>
					{/if}
					<span>{userDisplayName}</span>
				</Button>

				<DropDown
					onClose={() => (openUserDropdown = false)}
					open={openUserDropdown}
					parentRef={dropdownTriggerRef as HTMLButtonElement}
					header="User options"
					items={[
						{ text: tClient('common.settings'), startIcon: UserCog, hasDivider: true },
						{
							text: tClient('common.logout'),
							startIcon: Logout,
							onSelect: handleLogout
						}
					]}
				/>
			{:else if !$userStore && !$page.url.pathname.startsWith('/auth')}
				<a href={AppRoute.AUTH_SIGNIN}>
					<Button variant="filled" size="sm">{tClient('signin.title')}</Button>
				</a>
			{/if}
		</div>
	</div>
</header>

<style lang="postcss">
	.cart-quantity {
		@apply absolute -right-1/4 -top-1/4 z-[99999999] !text-[10px] flex h-4 min-w-4 items-center text-xs justify-center rounded-full bg-blue-500 p-1 font-bold text-white;
	}
</style>
