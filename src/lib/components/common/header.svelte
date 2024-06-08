<script lang="ts">
	import { Button } from '$lib/components/ui';
	import Logo from './logo.svelte';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { page } from '$app/stores';
	import { CART_ITEMS_STORE } from '$lib/stores/app';
	import { Flame, Home, Search, ShoppingBag } from '../icons';

	$: userAvatarStyle = $userStore?.avatar?.url
		? `background-image: url("${$userStore.avatar.url}")`
		: '';

	let userDisplayName = '';
	$: {
		if ($userStore?.firstName && $userStore.lastName)
			userDisplayName = `${$userStore.firstName[0]}${$userStore.lastName[0]}`;
		else if ($userStore?.email) userDisplayName = $userStore.email.slice(0, 2);
	}
</script>

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-sm z-[99999999999] w-full">
	<div class="w-1/2 flex items-center gap-3">
		<!-- logo -->
		<a href={AppRoute.HOME} class="inline">
			<Logo />
		</a>

		<!-- search -->
		<div>
			<label class="input flex items-center gap-2 input-sm">
				<input type="text" class="grow" placeholder="Enter your search" />
				<span>
					<Search />
				</span>
			</label>
		</div>
	</div>
	<div class="w-1/2 flex justify-between">
		<div class="flex gap-1">
			<a href={AppRoute.HOME}>
				<Button variant="subtle" size="sm">
					<Home slot="startIcon" />
					<span>Home</span>
				</Button>
			</a>
			<a href={AppRoute.TRENDING}>
				<Button variant="subtle" size="sm">
					<Flame slot="startIcon" />
					<span>Trending</span>
				</Button>
			</a>
		</div>

		<div class="flex items-center gap-3.5">
			<!-- shopping cart button -->
			<a href={AppRoute.SHOPPING_CART}>
				<button class="btn btn-square btn-sm relative">
					<span class="text-xl">
						<ShoppingBag />
					</span>
					<span class="cart-quantity">
						{$CART_ITEMS_STORE.length}
					</span>
				</button>
			</a>
			<div class="dropdown dropdown-end">
				{#if $userStore}
					<button tabIndex="0" class="btn btn-sm uppercase">
						{#if $userStore.avatar && $userStore.avatar.url}
							<span
								class="rounded-full w-6 h-6 bg-blue-300 flex items-center justify-center font-bold bg-cover bg-center bg-no-repeat"
								style={userAvatarStyle}
							>
							</span>
							<span>{userDisplayName}</span>
						{/if}
					</button>
					<ul class="dropdown-content menu shadow rounded-box w-52">
						<li>
							<a href="#">Item 1</a>
						</li>
						<li>
							<a href="#">Item 2</a>
						</li>
						<li>
							<span>Logout</span>
						</li>
					</ul>
				{:else if !$userStore && !$page.url.pathname.startsWith('/auth')}
					<a href={AppRoute.AUTH_SIGNIN}>
						<Button variant="filled" size="xs">Signin</Button>
					</a>
				{/if}
			</div>
		</div>
	</div>
</header>

<style lang="postcss">
	.cart-quantity {
		@apply absolute -right-1/4 -top-1/4 z-[99999999] flex h-4 min-w-4 items-center text-xs justify-center rounded-full bg-blue-500 p-1 font-bold text-white;
		font-size: 10px !important;
	}
</style>
