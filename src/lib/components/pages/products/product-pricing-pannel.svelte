<script lang="ts">
	import { tClient } from '$i18n';
	import { MapPin, Minus, Plus, ShoppingBagPlus, BurstSale, Heart } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { Product, ProductVariant } from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { defaultChannel, MAX_RATING } from '$lib/utils/consts';
	import { formatMoney } from '$lib/utils/utils';
	import { fade, fly } from 'svelte/transition';
	import { Rating } from '$lib/components/common/rating';
	import { cartItemStore } from '$lib/stores/app';
	import { toastStore } from '$lib/stores/ui/toast';
	import { IconButton } from '$lib/components/ui/Button';
	import Input from '$lib/components/ui/Input/input.svelte';
	import { reorganizeCartItems } from '$lib/stores/app/cart';
	import { Badge } from '$lib/components/ui/badge';

	type Props = {
		productInformation: Omit<Product, 'variants'>;
		productVariants: ProductVariant[];
	};

	let { productInformation, productVariants }: Props = $props();

	let userDefaultShippingAddress = $state(tClient('product.chooseAddress'));

	/** user selected variant quantity */
	let quantitySelected = $state(1);
	let selectedVariant = $state<ProductVariant>();

	let displayPrice = $derived.by(() => {
		if (!selectedVariant)
			return formatMoney(
				productInformation.pricing?.priceRange?.start?.gross.currency || defaultChannel.currency,
				productInformation.pricing?.priceRange?.start?.gross.amount || 0,
				productInformation.pricing?.priceRange?.stop?.gross.amount
			);

		return formatMoney(
			selectedVariant.pricing?.price?.gross.currency || defaultChannel.currency,
			selectedVariant.pricing?.price?.gross.amount || 0
		);
	});

	const toggleSelectVariant = (variant: ProductVariant) => {
		if (!selectedVariant) {
			selectedVariant = variant;
		} else {
			selectedVariant = selectedVariant.id === variant.id ? undefined : variant;
		}
	};

	$effect(() => {
		if ($userStore && $userStore.addresses) {
			const defaultShipAddr = $userStore.addresses.find((addr) => addr.isDefaultShippingAddress);
			if (defaultShipAddr) {
				userDefaultShippingAddress = `${defaultShipAddr.streetAddress1 || defaultShipAddr.streetAddress2}, ${defaultShipAddr.cityArea}, ${defaultShipAddr.city}`;
			}
		}
	});

	const handleAddToCart = async () => {
		if (!selectedVariant) {
			toastStore.send({
				variant: 'warning',
				message: tClient('error.noVariantSelected')
			});
			return;
		}
		cartItemStore.update((items) =>
			reorganizeCartItems(
				items.concat({
					productName: productInformation.name,
					quantity: quantitySelected,
					productSlug: productInformation.slug,
					variantId: selectedVariant!.id,
					previewImage: productInformation.thumbnail ? productInformation.thumbnail.url : '',
					previewImageAlt: productInformation.thumbnail ? productInformation.thumbnail.alt : ''
				})
			)
		);
	};
</script>

{#snippet slotText()}
	<p slot="text" class="text-sm font-medium underline ml-1 text-gray-700">
		{#if typeof productInformation.rating === 'number'}
			{productInformation.rating} out of {MAX_RATING}
		{:else}
			{MAX_RATING} out of {MAX_RATING}
		{/if}
	</p>
{/snippet}

<div class="bg-white w-3/5 rounded-md border tablet:w-full p-4">
	<h1 class="text-gray-700 text-xl font-semibold mb-1">{productInformation.name}</h1>
	<div class="flex items-center text-red-500 gap-2 mb-4">
		<Rating
			total={5}
			rating={typeof productInformation.rating === 'number'
				? productInformation.rating
				: MAX_RATING}
			{slotText}
		></Rating>
	</div>

	<div class="mb-5 bg-gray-50 rounded px-5 py-2">
		<!-- price -->
		<div class="">
			<div class="text-blue-700 font-semibold text-xl mb-1">
				{displayPrice}
			</div>
			{#if productInformation.pricing?.discount}
				{@const {
					pricing: {
						discount: {
							gross: { amount, currency }
						}
					}
				} = productInformation}

				<Badge
					color="red"
					variant="filled"
					startIcon={BurstSale}
					text={formatMoney(currency, amount)}
				/>
			{/if}
		</div>
	</div>

	<!-- delivery -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.delivery')}</span>
		<div class="w-5/6 text-blue-700 font-normal flex items-center">
			<span class="text-sm mr-1">{userDefaultShippingAddress}</span>
			<IconButton icon={MapPin} rounded size="xs" variant="light" />
		</div>
	</div>

	<!-- variant -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.variants')}</span>
		<div class="w-5/6">
			<div class="flex gap-2 flex-wrap flex-row text-blue-600 text-sm">
				{#each productVariants as variant, idx (idx)}
					<Button
						size="sm"
						variant="outline"
						onclick={() => toggleSelectVariant(variant)}
						tabindex={0}
						disabled={!variant.quantityAvailable}
						class={`${selectedVariant?.id === variant.id ? '!bg-blue-100 !font-semibold' : ''}`}
						color="indigo"
					>
						{variant.name}
					</Button>
				{/each}
			</div>
		</div>
	</div>

	<!-- quantity selection -->
	<div class="flex flex-row items-center mb-20 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.quantity')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<div class="flex items-center gap-1">
				<IconButton
					icon={Minus}
					color="red"
					variant="light"
					size="sm"
					onclick={() => quantitySelected--}
					disabled
				/>
				<Input
					size="sm"
					type="number"
					min={1}
					max={selectedVariant?.quantityAvailable}
					class="text-center inline-flex w-20"
					value={quantitySelected < 1 ? 1 : quantitySelected}
				/>
				<IconButton
					icon={Plus}
					color="indigo"
					variant="light"
					size="sm"
					onclick={() => quantitySelected++}
				/>
			</div>
			<!-- quantity available -->
			{#if selectedVariant}
				<span class="text-gray-600 text-xs ml-2" transition:fade={{ duration: 100 }}>
					{tClient('product.variantAvailable', { quantity: selectedVariant.quantityAvailable })}
				</span>
			{/if}
		</div>
	</div>

	<!-- purchase button -->
	<div class="flex gap-2 tablet:flex-wrap tablet:flex-col">
		<Button
			variant="filled"
			type="submit"
			color="indigo"
			startIcon={ShoppingBagPlus}
			onclick={handleAddToCart}
			fullWidth
			size="md"
		>
			<span> {tClient('product.addToCart')} </span>
		</Button>
		<Button
			variant="light"
			type="submit"
			startIcon={Heart}
			onclick={handleAddToCart}
			fullWidth
			size="md"
			color="gray"
		>
			<span> {tClient('product.addToCart')} </span>
		</Button>
	</div>
</div>
