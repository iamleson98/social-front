<script lang="ts">
	import type { LayoutServerData } from './$types';
	import ProductMediaSlideShow from './product-slide-show-pannel.svelte';
	import ProductPricingPanel from './product-pricing-pannel.svelte';
	import { type Product } from '$lib/gql/graphql';
	import { page } from '$app/stores';
	import {
		Icon,
		HeadSet,
		SettingCheck,
		FileText,
		PackageExport,
		MingcuteHome,
		type IconType
	} from '$lib/components/icons';
	import { afterNavigate, disableScrollHandling } from '$app/navigation';

	export let data: LayoutServerData;
	const { media, slug, ...productInformation } = data.data as Product;

	// prevent the page from scrolling to the top when navigating between tabs
	afterNavigate(() => {
		disableScrollHandling();
	});

	type TabType = {
		name: 'Description' | 'Attributes' | 'Customer Feedback' | 'Packaging';
		icon: IconType;
		path: string;
	};

	const tabs: TabType[] = [
		{
			name: 'Description',
			path: `/products/${slug}`,
			icon: FileText
		},
		{
			name: 'Attributes',
			path: `/products/${slug}/attributes`,
			icon: SettingCheck
		},
		{
			name: 'Customer Feedback',
			path: `/products/${slug}/customer-feedbacks`,
			icon: HeadSet
		},
		{
			name: 'Packaging',
			path: `/products/${slug}/packaging`,
			icon: PackageExport
		}
	];
</script>

<div class="m-auto max-w-6xl">
	<!-- breadcrumb -->
	<div class="breadcrumbs text-sm">
		<ul>
			<li>
				<a href="/" class="text-blue-600">
					<Icon icon={MingcuteHome} class="mr-1" />
					Home
				</a>
			</li>
			<li>
				<a href="/"> Documents </a>
			</li>
			<li>
				<span> Pillow </span>
			</li>
		</ul>
	</div>

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-1 w-full mb-1">
		<!-- slide show section -->
		<div class="w-2/5 rounded tablet:w-full flex flex-col gap-1">
			<ProductMediaSlideShow medias={media || []} />
		</div>

		<!-- product basic prices -->
		<div class="bg-white w-3/5 rounded tablet:w-full p-4">
			<ProductPricingPanel {productInformation} />
		</div>
	</div>

	<!-- product more details -->
	<div class="bg-white w-full rounded p-6">
		<div class="text-gray-700 text-lg font-semibold mb-4">Product Information</div>

		<div class="flex items-center gap-2 mb-4">
			{#each tabs as tab, idx (idx)}
				<a role="tab" class="inline" href={tab.path}>
					<button class="btn btn-sm border-none" class:tab-active={tab.path === $page.url.pathname}>
						<Icon icon={tab.icon} />
						<span>{tab.name}</span>
					</button>
				</a>
			{/each}
		</div>

		<slot />
	</div>
</div>

<style lang="postcss">
	.tab-active {
		@apply bg-blue-100 text-blue-600 hover:bg-blue-100;
		outline: none !important;
	}
</style>
