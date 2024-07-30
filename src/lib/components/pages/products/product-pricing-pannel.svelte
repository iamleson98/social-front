<script lang="ts">
	import { tClient } from '$i18n';
	import {
		Icon,
		MapPin,
		Minus,
		Plus,
		ShoppingBagPlus,
		Star,
		BurstSale
	} from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { Product, ProductVariant } from '$lib/gql/graphql';
	import { CART_ITEMS_STORE } from '$lib/stores/app';
	import { userStore } from '$lib/stores/auth';
	import { defaultChannel, MAX_RATING } from '$lib/utils/consts';
	import { formatMoney } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	export let productInformation: Omit<Product, 'media' | 'slug' | 'variants'>;
	export let productVariants: ProductVariant[];
	export let findingVariants: boolean;

	let userDefaultShippingAddress = tClient('product.chooseAddress');
	let quantitySelected = 1;

	onMount(() => {
		if ($userStore) {
			const defaultShipAddr = $userStore.addresses.find((addr, _) => addr.isDefaultShippingAddress);
			if (defaultShipAddr) {
				userDefaultShippingAddress = `${defaultShipAddr.streetAddress1 || defaultShipAddr.streetAddress2}, ${defaultShipAddr.cityArea}, ${defaultShipAddr.city}`;
			}
		}
	});
</script>

<div>
	<h1 class="text-gray-700 text-xl font-medium mb-2">{productInformation.name}</h1>

	<div class="flex items-center text-red-500 gap-2 mb-6">
		<span class="font-normal text-sm">{productInformation.rating}/{MAX_RATING}</span>
		<div class="rating rating-sm">
			<Icon icon={Star} />
			<Icon icon={Star} />
			<Icon icon={Star} />
			<Icon icon={Star} />
			<Icon icon={Star} />
		</div>
	</div>

	<div class="mb-5 bg-gray-50 rounded">
		<div class="stat place-items-start">
			<div class="stat-value text-blue-500 font-semibold text-xl">
				{formatMoney(
					productInformation.pricing?.priceRange?.start?.gross.currency || defaultChannel.currency,
					productInformation.pricing?.priceRange?.start?.gross.amount || 0,
					productInformation.pricing?.priceRange?.stop?.gross.amount
				)}
			</div>
			{#if productInformation.pricing?.discount}
				{@const {
					pricing: {
						discount: {
							gross: { amount, currency }
						}
					}
				} = productInformation}
				<div class="text-red-500 flex items-center">
					<span class="mr-2 text-red-700">
						<Icon icon={BurstSale} viewBox="0 0 100 100" class="text-red-500" />
					</span>
					<span class="text-xs font-medium flex items-center">
						<Icon icon={Minus} />
						{formatMoney(currency, amount)}
					</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- delivery -->
	<div class="flex flex-row items-center mb-5">
		<span class="text-gray-400 w-1/5 text-xs">{tClient('product.delivery')}</span>
		<div class="w-4/5">
			<span class="text-gray-500 text-sm mr-1">{userDefaultShippingAddress}</span>
			<button class="btn btn-circle btn-xs bg-blue-100 hover:bg-blue-200 text-blue-500 border-none">
				<Icon icon={MapPin} />
			</button>
		</div>
	</div>

	<!-- variant -->
	<div class="flex flex-row items-center mb-5">
		<span class="text-gray-400 w-1/5 text-xs">{tClient('product.variants')}</span>
		<div class="flex items-start w-4/5">
			<div class="flex gap-2 flex-wrap flex-row text-blue-600 text-sm">
				{#if findingVariants}
					<div class="rounded py-2 px-3"></div>
				{:else}
					{#each productVariants as variant, idx (idx)}
						<div class="rounded py-1 px-3 bg-blue-100">
							{variant.name}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- quantity selection -->
	<div class="flex flex-row items-center mb-20">
		<span class="text-gray-400 w-1/5 text-xs">{tClient('product.quantity')}</span>
		<div class="w-4/5 join">
			<button
				class="btn btn-sm join-item"
				on:click={() => quantitySelected--}
				disabled={quantitySelected <= 1}
			>
				<Icon icon={Minus} />
			</button>
			<input
				type="number"
				class="w-14 text-right input input-sm join-item"
				value={quantitySelected < 1 ? 1 : quantitySelected}
			/>
			<button class="btn btn-sm join-item" on:click={() => quantitySelected++}>
				<Icon icon={Plus} />
			</button>
		</div>
	</div>

	<!-- purchase button -->
	<div>
		<Button
			variant="filled"
			color="blue"
			on:click={() => {
				CART_ITEMS_STORE.update((items) => {
					return items.concat({
						previewImage: 'lol',
						productName: 'lol',
						quantity: 1,
						previewImageAlt: 'lol',
						productSlug: 'lol'
					});
				});
			}}
		>
			<Icon icon={ShoppingBagPlus} slot="startIcon" />
			<span> Add to Cart </span>
		</Button>
	</div>
</div>
