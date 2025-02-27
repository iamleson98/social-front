<script lang="ts">
	import { Icon, RosetteDiscountChecked } from '$lib/components/icons';
	import Sidebar from '$lib/components/pages/me/sidebar.svelte';
	import { userStore } from '$lib/stores/auth';
	import { onMount, type Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	type Props = {
		children: Snippet;
		data: LayoutServerData;
	};

	let { children, data }: Props = $props();

	onMount(() => {
		userStore.set(data.user);
	});

	let userNameDisplay = $derived.by(() => {
		if ($userStore?.firstName && $userStore?.lastName) {
			return `${$userStore?.firstName} ${$userStore?.lastName}`;
		}

		return $userStore?.email;
	});
</script>

<!-- MARK: Header -->
<div class="flex items-start gap-2 text-gray-700">
	<div class="rounded-full h-16 w-16 overflow-hidden">
		<img src={$userStore?.avatar?.url} alt={$userStore?.avatar?.alt} class="h-full w-full" />
	</div>
	<div>
		<div class="text-lg font-semibold">
			{userNameDisplay}
		</div>
		<div class="flex items-center gap-1">
			<Icon icon={RosetteDiscountChecked} class="text-blue-500 h-6 w-6" />
			<span class="text-sm text-gray-500">Verified</span>
		</div>
	</div>
</div>

<!-- MARK: Detail -->
<div class="flex flex-nowrap mt-5 gap-2">
	<Sidebar />

	<div class="w-3/5">
		{@render children()}
	</div>
</div>
