<script lang="ts">
	import { tClient } from '$i18n';
	import { Box, CategoryPlus, InforCircle } from '$lib/components/icons';
	import { Tab, type TabItem } from '$lib/components/ui/Tab';
	import { type Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { page } from '$app/state';
	import { AppRoute } from '$lib/utils';
	import { afterNavigate } from '$app/navigation';
	import Icon from '$lib/components/icons/icon.svelte';

	interface Props {
		data: LayoutServerData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let tabs = $state.raw<TabItem[]>([
		{
			title: `${tClient('product.products')}`,
			icon: Box,
			href: `${AppRoute.CATEGORIES}/${page.params.slug}`,
			active: false
		},
		{
			title: `${tClient('product.subCategories')} (${data.category?.children?.totalCount || ''})`,
			icon: CategoryPlus,
			href: `${AppRoute.CATEGORIES}/${page.params.slug}/sub-categories`,
			active: false
		},
		{
			title: tClient('product.detail'),
			icon: InforCircle,
			href: `${AppRoute.CATEGORIES}/${page.params.slug}/info`,
			active: false
		}
	]);

	afterNavigate(() => {
		tabs = tabs.map((tab) => ({ ...tab, active: page.url.pathname === tab.href }));
	});
</script>

<div class="flex gap-2">
	<!-- sidebar -->
	<div class="bg-white rounded-md p-3 w-1/4 tablet:w-full">
		<div
			class="h-64 mb-4 w-64 rounded-sm bg-cover bg-center bg-no-repeat"
			style={`background-image: url(${data.category?.backgroundImage?.url});`}
		></div>

		<div class="bg-gray-300 h-px"></div>
	</div>

	<!-- tabs -->
	<div class="bg-white rounded-md p-3 w-3/4 tablet:w-full">
		<div class="mb-4">
			<div class="tabs tabs-border" role="tablist">
				{#each tabs as item, idx (idx)}
					{@const elem = item.href ? 'a' : 'div'}
					{@const attrs = item.href ? { href: item.href } : {}}
					<svelte:element this={elem} class="tab" class:tab-active={item.active} {...attrs}>
						{#if item.icon}
							<Icon icon={item.icon} class="mr-1.5" />
						{/if}
						<span>{item.title}</span>
					</svelte:element>
				{/each}
			</div>
		</div>

		<div>
			{@render children()}
		</div>
	</div>
</div>
