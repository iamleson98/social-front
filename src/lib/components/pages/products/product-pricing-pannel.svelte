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
	import { userStore } from '$lib/stores/auth';
	import { defaultChannel, MAX_RATING } from '$lib/utils/consts';
	import { formatMoney, preHandleGraphqlResult } from '$lib/utils/utils';
	import { fade } from 'svelte/transition';
	import { Rating } from '$lib/components/common/rating';
	import { cartItemStore } from '$lib/stores/app';
	import { toastStore } from '$lib/stores/ui/toast';

	type Props = {
		productInformation: Omit<Product, 'variants'>;
		productVariants: readonly ProductVariant[];
		/** indicate the variants are being fetched */
		loading: boolean;
		/** we can know before hand how many variants does a product has */
		numOfVariants: number;
	};

	let { productInformation, productVariants, loading, numOfVariants }: Props = $props();

	let userDefaultShippingAddress = $state(tClient('product.chooseAddress'));

	/** user selected variant quantity */
	let quantitySelected = $state(1);

	const toggleSelectVariant = (idx: number) => {
		activeVariantIdx = activeVariantIdx === idx ? null : idx;
	};

	/** track selected variant, 0 based */
	let activeVariantIdx = $state<number | null>(null);

	let variantQuantityAvailable = $derived(
		activeVariantIdx != null ? productVariants[activeVariantIdx]?.quantityAvailable : null
	);

	$effect(() => {
		if ($userStore && $userStore.addresses) {
			const defaultShipAddr = $userStore.addresses.find((addr, _) => addr.isDefaultShippingAddress);
			if (defaultShipAddr) {
				userDefaultShippingAddress = `${defaultShipAddr.streetAddress1 || defaultShipAddr.streetAddress2}, ${defaultShipAddr.cityArea}, ${defaultShipAddr.city}`;
			}
		}
	});

	const handleAddToCart = async () => {
		if (activeVariantIdx == null) {
			toastStore.send({
				variant: 'warning',
				message: 'Please select a variant'
			});
			return;
		}
		cartItemStore.update((items) =>
			items.concat({
				productName: productInformation.name,
				quantity: quantitySelected,
				productSlug: productInformation.slug,
				variantId: productVariants[activeVariantIdx as number].id,
				previewImage: productInformation.media ? productInformation.media[0]?.url : '',
				previewImageAlt: productInformation.media ? productInformation.media[0]?.alt : ''
			})
		);
	};
</script>

{#snippet slotText()}
	<p slot="text" class="text-sm ml-1 text-gray-700">
		{#if typeof productInformation.rating === 'number'}
			{productInformation.rating} out of {MAX_RATING}
		{:else}
			{MAX_RATING} out of {MAX_RATING}
		{/if}
	</p>
{/snippet}

<div class="bg-white w-3/5 rounded tablet:w-full p-4">
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

	<div class="mb-5 bg-gray-50 rounded">
		<div class="stat place-items-start">
			<div class="stat-value text-blue-700 font-semibold text-xl">
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
					<span class="text-red-700">
						<Icon
							icon={BurstSale}
							viewBox="0 0 100 100"
							class="text-red-500"
							width="2rem"
							height="2rem"
						/>
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
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.delivery')}</span>
		<div class="w-5/6 text-blue-700 font-normal">
			<span class="text-sm mr-1">{userDefaultShippingAddress}</span>
			<button class="btn btn-circle btn-xs !bg-blue-100 text-blue-700 !border-0">
				<Icon icon={MapPin} />
			</button>
		</div>
	</div>

	<!-- variant -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.variants')}</span>
		<div class="w-5/6">
			<div class="flex gap-2 flex-wrap flex-row text-blue-600 text-sm">
				{#if loading}
					{#each new Array(numOfVariants) as _}
						<div class="flex animate-pulse rounded bg-gray-100 p-2">
							<div class="h-1 mb-1 w-4 rounded-sm bg-gray-300 mr-1"></div>
							<div class="h-3 w-10 rounded-full bg-gray-300"></div>
						</div>
					{/each}
				{:else}
					{#each productVariants as variant, idx (idx)}
						<button
							class={`btn btn-sm text-blue-700 border-none font-normal shadow-none bg-blue-100 hover:bg-blue-200 ${activeVariantIdx === idx ? '!bg-blue-200 font-semibold' : ''}`}
							disabled={!variant.quantityAvailable}
							tabindex="0"
							onclick={() => toggleSelectVariant(idx)}
						>
							<span>
								{variant.name}
							</span>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- quantity selection -->
	<div class="flex flex-row items-center mb-20 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.quantity')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<div class="join">
				<button
					class="btn btn-sm join-item"
					onclick={() => quantitySelected--}
					disabled={quantitySelected <= 1}
				>
					<Icon icon={Minus} />
				</button>
				<input
					type="number"
					class="w-14 text-center input input-sm join-item"
					value={quantitySelected < 1 ? 1 : quantitySelected}
					max={variantQuantityAvailable}
				/>
				<button class="btn btn-sm join-item" onclick={() => quantitySelected++}>
					<Icon icon={Plus} />
				</button>
			</div>
			<!-- quantity available -->
			{#if variantQuantityAvailable != null}
				<span class="text-gray-600 text-xs ml-2" transition:fade={{ duration: 100 }}>
					{tClient('product.variantAvailable', { quantity: variantQuantityAvailable })}
				</span>
			{/if}
		</div>
	</div>

	<!-- purchase button -->
	<div class="">
		<Button
			variant="filled"
			type="submit"
			color="blue"
			startIcon={ShoppingBagPlus}
			onclick={handleAddToCart}
		>
			<span> {tClient('product.addToCart')} </span>
		</Button>
	</div>
</div>
