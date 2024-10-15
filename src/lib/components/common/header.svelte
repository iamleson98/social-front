<script lang="ts">
	import { Button } from '$lib/components/ui';
	import Logo from './logo.svelte';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { page } from '$app/stores';
	import { cartItemStore } from '$lib/stores/app';
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
	import { noop, preHandleGraphqlResult } from '$lib/utils/utils';
	import { tClient } from '$i18n';

	let userAvatarStyle = $state('');
	let userDisplayName = $state('');
	let openUserDropdown = $state(false);

	let dropdownTriggerRef = $state<HTMLButtonElement>();

	$effect(() => {
		if ($userStore?.avatar?.url) {
			userAvatarStyle = `background-image: url("${$userStore.avatar.url}")`;
		}
		if ($userStore?.firstName && $userStore.lastName)
			userDisplayName = `${$userStore.firstName[0]}${$userStore.lastName[0]}`;
		else if ($userStore?.email) userDisplayName = $userStore.email.slice(0, 2);
	});

	// fetch current user
	$effect(() => {
		let unsubscribe = noop;

		if (!$userStore) {
			unsubscribe = graphqlClient
				.query<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, { requestPolicy: 'network-only' })
				.subscribe((result) => {
					if (preHandleGraphqlResult(result)) {
						return;
					}

					userStore.set(result.data?.me);
				}).unsubscribe;
		}

		return unsubscribe;
	});
</script>

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-sm z-[40] w-full">
	<!-- navigating -->
	<div class="w-1/2 flex items-center gap-3">
		<!-- logo -->
		<a href={AppRoute.HOME} class="inline">
			<Logo />
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
					{#key $cartItemStore}
						<span class="cart-quantity" in:scale>
							{$cartItemStore.length}
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
					{#if $userStore.avatar && $userStore.avatar.url}
						<span
							class="rounded-full w-6 h-6 bg-blue-300 flex items-center justify-center font-bold bg-cover bg-center bg-no-repeat"
							style={userAvatarStyle}
						>
						</span>
						<span>{userDisplayName}</span>
					{/if}
				</Button>

				<DropDown
					onClose={() => (openUserDropdown = false)}
					open={openUserDropdown}
					parentRef={dropdownTriggerRef as HTMLButtonElement}
					header="User options"
					items={[
						// { text: 'Profile', startIcon: IonFlame },
						{ text: tClient('common.settings'), startIcon: UserCog, hasDivider: true },
						{ text: tClient('common.logout'), startIcon: Logout }
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
