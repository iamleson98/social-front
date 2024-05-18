<script lang="ts">
	import { Button } from '$lib/components/ui';
	import Logo from './logo.svelte';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { page } from '$app/stores';
</script>

<header class="fixed top-0 left-0 right-0 flex p-2 bg-white shadow-sm" style="z-index: 99999;">
	<div class="w-1/2">
		<Logo />
	</div>
	<div class="w-1/2 flex justify-between">
		<div class="flex gap-1">
			<a href={AppRoute.HOME}>
				<Button variant="subtle" size="sm" startIcon="icon-[system-uicons--home-door]">
					<span>Home</span>
				</Button>
			</a>
			<a href={AppRoute.TRENDING}>
				<Button variant="subtle" size="sm" startIcon="icon-[system-uicons--flame]">Trending</Button>
			</a>
		</div>

		<div class="">
			<div class="dropdown dropdown-end">
				{#if $userStore}
					<Button
						variant="subtle"
						tabIndex="0"
						size="sm"
						endIcon="icon-[system-uicons--chevron-down]"
					>
						{#if $userStore.avatar && $userStore.avatar.url}
							<span
								class="rounded-full w-7 h-7 bg-blue-300 flex items-center justify-center font-bold social-avatar"
								style={`background-image: url("${$userStore.avatar.url}")`}
							>
							</span>
						{:else if $userStore.email}
							<span
								class="rounded-full w-7 h-7 bg-blue-300 flex items-center justify-center font-bold"
							>
								{$userStore.email.slice(0, 2).toUpperCase()}
							</span>
						{/if}
					</Button>
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
				{:else if !$userStore && !$page.url.pathname.startsWith('auth')}
					<a href={AppRoute.AUTH_SIGNIN}>
						<Button variant="filled" size="sm">Signin</Button>
					</a>
				{/if}
				<!-- <div class="rounded px-2 py-1 flex items-center justify-between hover:bg-blue-200" role="button">
					<div class="rounded-full bg-blue-300 flex items-center justify-center mr-2 w-7 h-7 text-white">L</div>
					<span class="icon-[system-uicons--chevron-down]"></span>
				</div> -->
			</div>
		</div>
	</div>
</header>

<style>
	.social-avatar {
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
