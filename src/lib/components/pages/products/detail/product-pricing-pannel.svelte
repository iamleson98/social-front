<script lang="ts">
	import { tranFunc } from '$i18n';
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
	import { HTTPStatusSuccess, MAX_RATING } from '$lib/utils/consts';
	import { formatMoney, preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { fade } from 'svelte/transition';
	import { Rating } from '$lib/components/ui/rating';
	import { checkoutStore } from '$lib/stores/app';
	import { toastStore } from '$lib/stores/ui/toast';
	import { IconButton } from '$lib/components/ui/Button';
	import { Badge } from '$lib/components/ui/badge';
	import { CHECKOUT_ADD_LINE_MUTATION } from '$lib/api/checkout';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { MegaMenu } from '$lib/components/ui/MegaMenu';
	import { VIETNAM_COUNTRY_UNITS } from '$lib/utils/countries';
	import { AppRoute } from '$lib/utils';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import { CHANNELS } from '$lib/utils/channels';

	type Props = {
		productInformation: Omit<Product, 'variants'>;
		productVariants: ProductVariant[];
	};

	let { productInformation, productVariants }: Props = $props();

	/** user selected variant quantity */
	let quantitySelected = $state(1);
	let selectedVariant = $state<ProductVariant>();
	let showAlertSelectVariant = $state(false);
	let openDeliveryModal = $state(false);

	let quantitySelectedErr = $derived.by(() => {
		if (quantitySelected < 1 || quantitySelected % 1 !== 0)
			return $tranFunc('error.positiveInteger');
		return undefined;
	});

	let displayPrice = $derived.by(() => {
		const prdChannel = CHANNELS.find((chan) => chan.slug === productInformation.channel);
		if (!selectedVariant)
			return formatMoney(
				productInformation.pricing?.priceRange?.start?.gross.currency || prdChannel!.currency,
				productInformation.pricing?.priceRange?.start?.gross.amount || 0,
				productInformation.pricing?.priceRange?.stop?.gross.amount
			);

		return formatMoney(
			selectedVariant.pricing?.price?.gross.currency || prdChannel!.currency,
			selectedVariant.pricing?.price?.gross.amount || 0
		);
	});

	let userShippingAddress = $derived.by(() => {
		if (!$userStore || !$userStore?.addresses?.length) return $tranFunc('product.chooseAddress');

		const defaulShippingAddress =
			$userStore.addresses.find((addr) => addr.isDefaultShippingAddress) || $userStore.addresses[0];

		return `${defaulShippingAddress.streetAddress1 || defaulShippingAddress.streetAddress2}, ${defaulShippingAddress.cityArea}, ${defaulShippingAddress.city}`;
	});

	const toggleSelectVariant = (variant: ProductVariant) => {
		if (!selectedVariant) {
			selectedVariant = variant;
		} else {
			selectedVariant = selectedVariant.id === variant.id ? undefined : variant;
		}
	};

	let checkoutAddLineStore =
		$state<
			OperationResultStore<Pick<Mutation, 'checkoutLinesAdd'>, MutationCheckoutLinesAddArgs>
		>();

	$effect(() => {
		if (!checkoutAddLineStore) return;

		const unsub = checkoutAddLineStore.subscribe((result) => {
			if (preHandleErrorOnGraphqlResult(result)) return;

			if (result.data?.checkoutLinesAdd?.errors?.length) {
				toastStore.send({
					message: result.data.checkoutLinesAdd.errors[0].message as string,
					variant: 'error'
				});
				return;
			}

			checkoutStore.set(result.data?.checkoutLinesAdd?.checkout as Checkout);
		});

		return () => unsub();
	});

	const handleAddVariantToCart = async () => {
		// user must select a variant before he can add it to the cart
		if (!selectedVariant) {
			showAlertSelectVariant = true;
			return;
		}

		showAlertSelectVariant = false;

		if (!$checkoutStore) {
			const fetchResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
			const fetchResultParsed = await fetchResult.json();

			if (fetchResultParsed.status !== HTTPStatusSuccess) {
				toastStore.send({
					variant: 'error',
					message: fetchResultParsed.message
				});
			}

			checkoutStore.set(fetchResultParsed.checkout);
		}

		checkoutAddLineStore = operationStore({
			kind: 'mutation',
			query: CHECKOUT_ADD_LINE_MUTATION,
			variables: {
				id: $checkoutStore?.id,
				lines: [
					{
						variantId: selectedVariant.id,
						quantity: quantitySelected
					}
				]
			}
		});
	};
</script>

{#snippet slotText()}
	<p slot="text" class="text-sm font-medium underline ml-1 text-gray-700">
		{typeof productInformation.rating === 'number' ? productInformation.rating : MAX_RATING} / {MAX_RATING}
	</p>
{/snippet}

<div class="bg-white w-3/5 rounded-lg border tablet:w-full p-4">
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
		<span class="w-1/6 text-xs">{$tranFunc('product.delivery')}</span>
		<div class="w-5/6 text-blue-700 font-normal flex items-center">
			<span class="text-sm mr-1">
				{userShippingAddress}
			</span>
			<IconButton
				icon={MapPin}
				rounded
				size="xs"
				variant="light"
				disabled={$checkoutAddLineStore?.fetching}
				onclick={() => (openDeliveryModal = true)}
			/>
		</div>
	</div>

	<!-- variant -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{$tranFunc('product.variants')}</span>
		<div class="w-5/6">
			<div class="flex gap-2 flex-wrap flex-row text-blue-600 text-sm">
				{#each productVariants as variant, idx (idx)}
					{@const isVariantActive = selectedVariant?.id === variant.id}
					<Button
						size="sm"
						variant="outline"
						onclick={() => toggleSelectVariant(variant)}
						tabindex={0}
						disabled={!variant.quantityAvailable || $checkoutAddLineStore?.fetching}
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
					<Alert size="xs" bordered variant="warning">{$tranFunc('error.noVariantSelected')}</Alert>
				</div>
			{/if}
		</div>
	</div>

	<!-- quantity selection -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-xs">{$tranFunc('product.quantity')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<div class="flex items-start gap-1">
				<IconButton
					icon={Minus}
					color="red"
					variant="light"
					size="sm"
					onclick={() => quantitySelected--}
					disabled={quantitySelected < 2 || $checkoutAddLineStore?.fetching}
				/>
				<Input
					size="sm"
					type="number"
					min={1}
					max={selectedVariant?.quantityAvailable || selectedVariant?.quantityLimitPerCustomer}
					class="text-center w-24!"
					bind:value={quantitySelected}
					disabled={$checkoutAddLineStore?.fetching}
					variant={quantitySelectedErr ? 'error' : 'info'}
					subText={quantitySelectedErr}
				/>
				<IconButton
					icon={Plus}
					color="indigo"
					variant="light"
					size="sm"
					onclick={() => quantitySelected++}
					disabled={quantitySelected >=
						((selectedVariant?.quantityAvailable ||
							selectedVariant?.quantityLimitPerCustomer) as number) ||
						$checkoutAddLineStore?.fetching}
				/>
			</div>
			<!-- quantity available -->
			{#if selectedVariant}
				<span class="text-gray-600 text-xs ml-2" transition:fade={{ duration: 100 }}>
					{$tranFunc('product.variantAvailable', { quantity: selectedVariant.quantityAvailable })}
				</span>
			{/if}
		</div>
	</div>

	<!-- customer policy -->
	<div class="flex flex-row items-center mb-6 text-gray-600">
		<span class="w-1/6 text-xs">{$tranFunc('product.prdPolicy')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<div class="w-2/3">
				<Alert variant="info" size="xs">{$tranFunc('product.prdPolicyDetail')}</Alert>
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
				onclick={handleAddVariantToCart}
				size="lg"
				disabled={$checkoutAddLineStore?.fetching}
			>
				<span>{$tranFunc('product.addToCart')}</span>
			</Button>
		</div>
	</div>
</div>

<Modal
	open={openDeliveryModal}
	header={$tranFunc('helpText.chooseDeliveryAddress')}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openDeliveryModal = false)}
	onCancel={() => (openDeliveryModal = false)}
	onOk={() => (openDeliveryModal = false)}
>
	<MegaMenu items={VIETNAM_COUNTRY_UNITS} onSelectWhole={console.log} onDeselect={console.log} />
</Modal>
