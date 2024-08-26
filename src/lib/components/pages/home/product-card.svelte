<script lang="ts">
	import { Heart, Icon, ShoppingBagPlus, TruckDelivery } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { AppRoute } from '$lib/utils';
	import { fade } from 'svelte/transition';

	type ProductProps = {
		name: string;
		categoryName: string;
		thumbnailUrl: string;
		price?: number;
		thumbnailAlt?: string | null;
		slug: string;
	};

	let { name, categoryName, thumbnailUrl, thumbnailAlt, slug }: ProductProps = $props();
</script>

<div class="bg-white rounded-lg border max-w-md m-auto mb-3" transition:fade>
	<!-- picture -->
	<div class="product-card-picture relative">
		<div class="p-5">
			<a href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}>
				<img src={thumbnailUrl} alt={thumbnailAlt} class="select-none" loading="lazy" />
			</a>
		</div>

		<div class="absolute top-0 right-0 p-2">
			<IconButton icon={Heart} variant="light" size="sm" />
		</div>
	</div>

	<!-- short detail -->
	<div class="p-6">
		<!-- title and price -->
		<div class="flex items-center justify-between mb-3">
			<a
				href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}
				class="font-semibold leading-5 text-lg text-gray-700 hover:underline">{name}</a
			>
			<p class="leading-5 font-extrabold text-blue-700 text-2xl">$299</p>
		</div>

		<!-- category -->
		<div class="mb-2">
			<Badge color="orange" variant="light" text={categoryName} />
		</div>

		<Button variant="filled" startIcon={ShoppingBagPlus} size="sm" fullWidth>Add to cart</Button>

		<div class="text-xs text-gray-500 flex items-center gap-1">
			<Icon icon={TruckDelivery} />
			<p>
				Estimated Delivery <span class="font-semibold text-gray-600">Jun 23 - Jun 24</span>
			</p>
		</div>
	</div>
</div>
