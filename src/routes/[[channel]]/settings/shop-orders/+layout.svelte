<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center text-sm justify-between"
>
	<div>{$tranFunc('settings.orders')}</div>
	<div>
		<Button size="xs" endIcon={Plus} href={AppRoute.ME_SUPPORT_NEW()}
			>{$tranFunc('settings.newOrder')}</Button
		>
	</div>
</div>

{@render children()}
