<script lang="ts">
	import { Icon, MapPin, Minus, Plus, ShoppingBagPlus, TagFilled } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { Product } from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { defaultChannel } from '$lib/utils/consts';
	import { formatMoney } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	export let productInformation: Omit<Product, 'media'>;

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
	<h1 class="text-gray-600 text-xl font-medium mb-3">{productInformation.name}</h1>
	<div class="mb-5 bg-gray-50 rounded px-5 py-3">
		<!-- price section -->
		<span class="block text-blue-500 font-semibold text-lg mb-1">
			{formatMoney(
				productInformation.pricing?.priceRange?.start?.gross.currency || defaultChannel.currency,
				productInformation.pricing?.priceRange?.start?.gross.amount || 0,
				productInformation.pricing?.priceRange?.stop?.gross.amount
			)}
		</span>

		<!-- discount section -->
		{#if productInformation.pricing?.discount}
			{@const {
				pricing: {
					discount: {
						gross: { amount, currency }
					}
				}
			} = productInformation}
			<div class="items-center inline-flex text-xs">
				<Icon icon={TagFilled} class="mr-1 text-red-500" />
				<span class="text-gray-500 rounded bg-gray-200 px-1">
					Sale -{formatMoney(currency, amount)}
				</span>
			</div>
		{/if}
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
		<div class="item-container flex w-4/5">
			<!-- {#each items as item, index}
            <SelectableItem
              content={item}
              selected={index === selectedItemIndex}
              on:select={() => handleSelectMaterial(index)}
            />
          {/each} -->
		</div>
	</div>

	<div class="flex flex-row items-center mb-3">
		<span class="text-gray-400 w-1/5 text-xs">Size</span>
		<div class="flex items-start w-4/5">
			<!-- {#each sizes as sizes, index}
            <SelectableItem
              content={sizes}
              selected={index === selectedSizeIndex}
              on:select={() => handleSelectSize(index)}
            />
          {/each} -->
		</div>
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
		<Button variant="filled" color="pink">
			<Icon icon={ShoppingBagPlus} slot="startIcon" />
			<span> Add to Cart </span>
		</Button>
	</div>
</div>
