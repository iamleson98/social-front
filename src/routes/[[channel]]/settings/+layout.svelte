<script lang="ts">
	import { CheckOff, Icon, RosetteDiscountChecked } from '$lib/components/icons';
	import Sidebar from '$lib/components/pages/settings/sidebar.svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';

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
</script>

{#if !$ME_PAGE_USER_STORE}
	<SkeletonContainer>
		<Skeleton class="w-full h-6" />
	</SkeletonContainer>
{:else}
	<!-- MARK: Header -->
	<div class="flex items-start gap-2 text-gray-700">
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

	<!-- MARK: Detail -->
	<div class="flex flex-nowrap mt-5 gap-2">
		<Sidebar />

		<div class="w-3/4">
			{@render children()}
		</div>
	</div>
{/if}
