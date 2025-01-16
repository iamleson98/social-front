<script lang="ts">
	import { tClient } from '$i18n';
	import {
		MapPin,
		Minus,
		Plus,
		ShoppingBagPlus,
		BurstSale,
		Icon,
		Check
	} from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type {
		Checkout,
		Mutation,
		MutationCheckoutLinesAddArgs,
		Product,
		ProductVariant
	} from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { CHANNEL_KEY, defaultChannel, MAX_RATING } from '$lib/utils/consts';
	import { formatMoney, preHandleGraphqlResult } from '$lib/utils/utils';
	import { fade } from 'svelte/transition';
	import { Rating } from '$lib/components/common/rating';
	import { checkoutStore } from '$lib/stores/app';
	import { toastStore } from '$lib/stores/ui/toast';
	import { IconButton } from '$lib/components/ui/Button';
	import Input from '$lib/components/ui/Input/input.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { graphqlClient } from '$lib/client';
	import { CHECKOUT_ADD_LINE_MUTATION } from '$lib/stores/api/checkout';
	import { clientSideGetCookieOrDefault, getCookieByKey } from '$lib/utils/cookies';
	import { Alert } from '$lib/components/ui/Alert';

	type Props = {
		productInformation: Omit<Product, 'variants'>;
		productVariants: ProductVariant[];
	};

	let { productInformation, productVariants }: Props = $props();

	/** user selected variant quantity */
	let quantitySelected = $state(1);
	let selectedVariant = $state<ProductVariant>();
	let isAddingItemToCart = $state(false);
	let showAlertSelectVariant = $state(false);

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

	const handleAddToCart = async () => {
		if (!selectedVariant) {
			showAlertSelectVariant = true;
			return;
		}

		showAlertSelectVariant = false;
		isAddingItemToCart = true;
		// we check if a checkout is already created.
		// If +layout.svelte failed to initialize checkout store, we create a new one.
		// Then we add new lines to the checkout.
		let checkouIdCookie = getCookieByKey(
			`checkout-${clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug)}`
		);

		const addLineResult = await graphqlClient
			.mutation<Pick<Mutation, 'checkoutLinesAdd'>, MutationCheckoutLinesAddArgs>(
				CHECKOUT_ADD_LINE_MUTATION,
				{
					id: checkouIdCookie,
					lines: [{ variantId: selectedVariant.id, quantity: quantitySelected }]
				}
			)
			.toPromise();
		isAddingItemToCart = false;

		if (preHandleGraphqlResult(addLineResult)) return;
		if (addLineResult.data?.checkoutLinesAdd?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: addLineResult.data.checkoutLinesAdd.errors[0].message as string
			});
			return;
		}

		checkoutStore.set(addLineResult.data?.checkoutLinesAdd?.checkout as Checkout);
	};

	let userShippingAddress = $derived.by(() => {
		if (!$userStore || !$userStore.addresses.length) return tClient('product.chooseAddress');

		const defaulShippingAddress =
			$userStore.addresses.find((addr) => addr.isDefaultShippingAddress) || $userStore.addresses[0];

		return `${defaulShippingAddress.streetAddress1 || defaulShippingAddress.streetAddress2}, ${defaulShippingAddress.cityArea}, ${defaulShippingAddress.city}`;
	});
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

	<div class="mb-5 bg-gray-100 rounded-sm px-5 py-2">
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
			<span class="text-sm mr-1">
				{userShippingAddress}
			</span>
			<IconButton icon={MapPin} rounded size="xs" variant="light" disabled={isAddingItemToCart} />
		</div>
	</div>

	<!-- variant -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.variants')}</span>
		<div class="w-5/6">
			<div class="flex gap-2 flex-wrap flex-row text-blue-600 text-sm">
				{#each productVariants as variant, idx (idx)}
					{@const isVariantActive = selectedVariant?.id === variant.id}
					<Button
						size="sm"
						variant="outline"
						onclick={() => toggleSelectVariant(variant)}
						tabindex={0}
						disabled={!variant.quantityAvailable || isAddingItemToCart}
						class={`${isVariantActive ? 'bg-blue-50!' : ''} relative`}
					>
						{variant.name}
						{#if isVariantActive}
							<span class="absolute top-0 right-0">
								<Icon icon={Check} />
							</span>
						{/if}
					</Button>
				{/each}
			</div>

			{#if showAlertSelectVariant}
				<div class="w-1/2 mt-2">
					<Alert size="xs" bordered variant="warning">{tClient('error.noVariantSelected')}</Alert>
				</div>
			{/if}
		</div>
	</div>

	<!-- quantity selection -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.quantity')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<div class="flex items-center gap-1">
				<IconButton
					icon={Minus}
					color="red"
					variant="light"
					size="sm"
					onclick={() => quantitySelected--}
					disabled={quantitySelected < 2 || isAddingItemToCart}
				/>
				<Input
					size="sm"
					type="number"
					min={1}
					max={selectedVariant?.quantityAvailable || selectedVariant?.quantityLimitPerCustomer}
					class="text-center w-24!"
					value={quantitySelected < 1 ? 1 : quantitySelected}
					disabled={isAddingItemToCart}
				/>
				<IconButton
					icon={Plus}
					color="indigo"
					variant="light"
					size="sm"
					onclick={() => quantitySelected++}
					disabled={quantitySelected >=
						((selectedVariant?.quantityAvailable ||
							selectedVariant?.quantityLimitPerCustomer) as number) || isAddingItemToCart}
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

	<!-- customer policy -->
	<div class="flex flex-row items-center mb-6 text-gray-600">
		<span class="w-1/6 text-xs">{tClient('product.prdPolicy')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<!-- <div class="flex items-center gap-1">
				Return product
			</div> -->
			<div class="w-2/3">
				<Alert variant="info" size="xs">{tClient('product.prdPolicyDetail')}</Alert>
			</div>
		</div>
	</div>

	<!-- purchase button -->
	<div class="flex flex-row items-center">
		<span class="w-1/6"></span>
		<div class="w-5/6">
			<Button
				variant="filled"
				type="submit"
				startIcon={ShoppingBagPlus}
				onclick={handleAddToCart}
				size="lg"
				disabled={isAddingItemToCart}
				loading={isAddingItemToCart}
			>
				<span>{tClient('product.addToCart')}</span>
			</Button>
		</div>
	</div>
</div>
