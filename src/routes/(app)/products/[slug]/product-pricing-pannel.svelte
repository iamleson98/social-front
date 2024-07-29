<script lang="ts">
	import {
		Icon,
		MapPin,
		Minus,
		Plus,
		ShoppingBagPlus,
		TagFilled,
		Star,
		ArrowDownRight
	} from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { Product } from '$lib/gql/graphql';
	import { CART_ITEMS_STORE } from '$lib/stores/app';
	import { userStore } from '$lib/stores/auth';
	import { defaultChannel } from '$lib/utils/consts';
	import { formatMoney } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	export let productInformation: Omit<Product, 'media' | 'slug'>;

	let userDefaultShippingAddress = 'please choose address';
	let quantitySelected = 1;

	onMount(() => {
		const user = get(userStore);
		if (user) {
			const defaultShipAddr = user.addresses.find((addr, _) => addr.isDefaultShippingAddress);
			if (defaultShipAddr) {
				userDefaultShippingAddress = `${defaultShipAddr.streetAddress1 || defaultShipAddr.streetAddress2}, ${defaultShipAddr.cityArea}, ${defaultShipAddr.city}`;
			}
		}
	});
</script>

<div>
	<h1 class="text-gray-700 text-xl font-medium mb-3">{productInformation.name}</h1>

	<div class="rating rating-sm mb-3 text-red-500">
		<Icon icon={Star} />
		<Icon icon={Star} />
		<Icon icon={Star} />
		<Icon icon={Star} />
		<Icon icon={Star} />
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
				<div class="stat-desc text-red-500 text-xs font-medium flex items-center">
					<Icon icon={ArrowDownRight} />
					<span>
						Sale -{formatMoney(currency, amount)}
					</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex flex-row items-center mb-3">
		<span class="text-gray-400 w-1/5 text-xs">Deliver to</span>
		<div class="w-4/5">
			<span class="text-gray-500 text-sm mr-1"> {userDefaultShippingAddress} </span>
			<button class="btn btn-circle btn-xs bg-blue-100 hover:bg-blue-200 text-blue-500 border-none">
				<Icon icon={MapPin} />
			</button>
		</div>
	</div>

	<div class="flex flex-row items-center mb-3">
		<span class="text-gray-400 w-1/5 text-xs">Material</span>
		<div class="item-container flex w-4/5"></div>
	</div>

	<div class="flex flex-row items-center mb-3">
		<span class="text-gray-400 w-1/5 text-xs">Size</span>
		<div class="flex items-start w-4/5"></div>
	</div>

	<div class="flex flex-row items-center mb-20">
		<span class="text-gray-400 w-1/5 text-xs">Quantity</span>
		<div class="flex items-center justify-start w-4/5">
			<button
				class="btn btn-xs btn-square mr-1"
				on:click={() => quantitySelected--}
				disabled={quantitySelected <= 1}
			>
				<Icon icon={Minus} />
			</button>
			<input
				type="number"
				class="mr-1 outline-none focus:outline-none w-14 text-right"
				value={quantitySelected < 1 ? 1 : quantitySelected}
			/>
			<button class="btn btn-xs btn-square" on:click={() => quantitySelected++}>
				<Icon icon={Plus} />
			</button>
		</div>
	</div>

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
