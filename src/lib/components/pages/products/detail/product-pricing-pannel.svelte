<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHECKOUT_ADD_LINE_MUTATION } from '$lib/api/checkout';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import {
		Minus,
		Plus,
		ShoppingBagPlus,
		Discount,
		Icon,
		Check,
		TruckDelivery,
		PencilMinus,
	} from '$lib/components/icons';
	import {
		TablerCirclePercentage,
		TablerMessageCircleFilled,
		TablerMessageReportFilled,
	} from '$lib/components/icons/consts';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { MegaMenu } from '$lib/components/ui/MegaMenu';
	import { Modal } from '$lib/components/ui/Modal';
	import { Rating } from '$lib/components/ui/rating';
	import type {
		Checkout,
		Mutation,
		MutationCheckoutLinesAddArgs,
		Product,
		ProductVariant,
	} from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import { AppRoute } from '$lib/utils';
	import { CHANNELS } from '$lib/utils/consts';
	import { HTTPStatusSuccess, MAX_RATING } from '$lib/utils/consts';
	import { VIETNAM_COUNTRY_UNITS } from '$lib/utils/countries';
	import { formatMoney, checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';

	type Props = {
		productInformation: Product;

		/** this component is used for product detail screen and preview modal.
		 * If `true`, only some important parts would be rendered */
		useForPreviewModal?: boolean;
	};

	let { productInformation, useForPreviewModal = false }: Props = $props();

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
				productInformation.pricing?.priceRange?.start?.gross?.currency || prdChannel!.currency,
				productInformation.pricing?.priceRange?.start?.gross?.amount || 0,
				productInformation.pricing?.priceRange?.stop?.gross?.amount,
			);

		return formatMoney(
			selectedVariant.pricing?.price?.gross?.currency || prdChannel!.currency,
			selectedVariant.pricing?.price?.gross?.amount || 0,
		);
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

		return checkoutAddLineStore.subscribe((result) => {
			if (checkIfGraphqlResultHasError(result, 'checkoutLinesAdd')) return;
			checkoutStore.set(result.data?.checkoutLinesAdd?.checkout as Checkout);
		});
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
				toast.error(fetchResultParsed.message);
			}

			checkoutStore.set(fetchResultParsed.checkout);
		}

		checkoutAddLineStore = operationStore<
			Pick<Mutation, 'checkoutLinesAdd'>,
			MutationCheckoutLinesAddArgs
		>({
			query: CHECKOUT_ADD_LINE_MUTATION,
			variables: {
				id: $checkoutStore?.id,
				lines: [
					{
						variantId: selectedVariant.id,
						quantity: quantitySelected,
					},
				],
			},
		});
	};

	const MessageCircleFilled = `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 14l-3-3h-7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1zm-7 1v2a1 1 0 0 1-1 1H6l-3 3V11a1 1 0 0 1 1-1h2"/>`;
	const MessageReport = `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm-6 4v3m0 3v.01"/>`;
	const ThumbupFilled = `<path fill="currentColor" d="M13 3a3 3 0 0 1 2.995 2.824L16 6v4h2a3 3 0 0 1 2.98 2.65l.015.174L21 13l-.02.196l-1.006 5.032c-.381 1.626-1.502 2.796-2.81 2.78L17 21H9a1 1 0 0 1-.993-.883L8 20l.001-9.536a1 1 0 0 1 .5-.865a3 3 0 0 0 1.492-2.397L10 7V6a3 3 0 0 1 3-3m-8 7a1 1 0 0 1 .993.883L6 11v9a1 1 0 0 1-.883.993L5 21H4a2 2 0 0 1-1.995-1.85L2 19v-7a2 2 0 0 1 1.85-1.995L4 10z"/>`;
	const RewindBack30 = `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19.007 16.466A6 6 0 0 0 15 6H4m8 9.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0-3 0M6 14h1.5a1.5 1.5 0 0 1 0 3H7h.5a1.5 1.5 0 0 1 0 3H6"/><path d="M7 9L4 6l3-3"/></g>`;
	const ShieldFilled = `<path fill="currentColor" d="m11.998 2l.118.007l.059.008l.061.013l.111.034a1 1 0 0 1 .217.112l.104.082l.255.218a11 11 0 0 0 7.189 2.537l.342-.01a1 1 0 0 1 1.005.717a13 13 0 0 1-9.208 16.25a1 1 0 0 1-.502 0A13 13 0 0 1 2.54 5.718a1 1 0 0 1 1.005-.717a11 11 0 0 0 7.531-2.527l.263-.225l.096-.075a1 1 0 0 1 .217-.112l.112-.034a1 1 0 0 1 .119-.021zm3.71 7.293a1 1 0 0 0-1.415 0L11 12.585l-1.293-1.292l-.094-.083a1 1 0 0 0-1.32 1.497l2 2l.094.083a1 1 0 0 0 1.32-.083l4-4l.083-.094a1 1 0 0 0-.083-1.32z"/>`;
</script>

<div class="bg-white rounded-lg border-gray-200 border p-4 h-full space-y-2">
	<div class="flex items-center gap-1">
		<Badge
			size="xs"
			startIcon={ShieldFilled}
			text={$tranFunc('product.badgeAuthentic')}
			variant="light"
			rounded
		/>
		<Badge
			size="xs"
			startIcon={RewindBack30}
			text={$tranFunc('product.badge30DaysReturn')}
			variant="light"
			rounded
			color="grape"
		/>
		<Badge
			size="xs"
			startIcon={TablerCirclePercentage}
			text={$tranFunc('product.badgeTopDeal')}
			variant="light"
			rounded
			color="red"
		/>
		<Badge
			size="xs"
			startIcon={TruckDelivery}
			text={$tranFunc('product.badgeFreeShip')}
			variant="light"
			rounded
			color="green"
		/>
		{#if productInformation.attributes.some((attr) => attr.attribute.slug === 'brand')}
			<Badge size="xs" text={$tranFunc('product.brand')} variant="light" rounded color="blue" />
		{/if}
	</div>

	<h1 class="text-gray-700 text-xl font-semibold mb-1">{productInformation.name}</h1>

	<div class="flex items-center text-red-500 gap-2 mb-4">
		<Rating
			total={5}
			rating={typeof productInformation.rating === 'number'
				? productInformation.rating
				: MAX_RATING}
		>
			{#snippet slotText()}
				<p class="text-sm font-medium underline ml-1 text-gray-700">
					{typeof productInformation.rating === 'number' ? productInformation.rating : MAX_RATING} /
					{MAX_RATING}
				</p>
			{/snippet}
		</Rating>

		<div class="w-px h-6 bg-gray-300"></div>

		<IconButton
			aria-label={$tranFunc('product.reportProduct')}
			class="tooltip tooltip-bottom"
			data-tip={$tranFunc('product.reportProduct')}
			icon={TablerMessageReportFilled}
			size="xs"
			color="gray"
			variant="light"
		/>

		<div class="w-px h-6 bg-gray-300"></div>

		<IconButton
			aria-label={$tranFunc('product.contactSeller')}
			class="tooltip tooltip-bottom"
			data-tip={$tranFunc('product.contactSeller')}
			icon={TablerMessageCircleFilled}
			size="xs"
			color="blue"
			variant="light"
		/>
	</div>

	<div class="mb-5 bg-gray-100 rounded-sm px-5 py-2">
		<!-- MARK: price -->
		<div>
			<div class="text-blue-700 font-semibold text-xl mb-1">
				{displayPrice}
			</div>
			{#if productInformation.pricing?.discount}
				{@const {
					pricing: {
						discount: {
							gross: { amount, currency },
						},
					},
				} = productInformation}

				<Badge
					color="red"
					variant="filled"
					startIcon={Discount}
					text={formatMoney(currency, amount)}
				/>
			{/if}
		</div>
	</div>

	<!-- MARK: variants -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-sm">{$tranFunc('product.variants')}</span>
		<div class="w-5/6">
			<div class="flex gap-2 flex-wrap flex-row text-blue-600 text-sm">
				{#each productInformation.variants || [] as variant, idx (idx)}
					{@const isVariantActive = selectedVariant?.id === variant.id}
					<Button
						size="xs"
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

	<!-- MARK: quantity selection -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 text-sm">{$tranFunc('product.quantity')}</span>
		<div class="w-5/6 flex items-center flex-wrap flex-row">
			<div class="flex items-start gap-1">
				<IconButton
					icon={Minus}
					color="red"
					variant="light"
					aria-label="decrease quantity"
					size="sm"
					onclick={() => quantitySelected--}
					disabled={quantitySelected < 2 || $checkoutAddLineStore?.fetching}
				/>
				<Input
					size="sm"
					type="number"
					min={1}
					max={selectedVariant?.quantityLimitPerCustomer || selectedVariant?.quantityAvailable}
					class="text-center w-24!"
					bind:value={quantitySelected}
					disabled={$checkoutAddLineStore?.fetching}
					variant={quantitySelectedErr ? 'error' : 'info'}
					subText={quantitySelectedErr}
				/>
				<IconButton
					icon={Plus}
					variant="light"
					size="sm"
					aria-label="increase quantity"
					onclick={() => quantitySelected++}
					disabled={quantitySelected >=
						((selectedVariant?.quantityLimitPerCustomer ||
							selectedVariant?.quantityAvailable) as number) || $checkoutAddLineStore?.fetching}
				/>
			</div>
			<!-- MARK: quantity available -->
			{#if selectedVariant}
				<span class="text-gray-600 text-sm ml-2" transition:fade={{ duration: 100 }}>
					{$tranFunc('product.variantAvailable', {
						quantity: selectedVariant.quantityLimitPerCustomer || selectedVariant.quantityAvailable,
					})}
				</span>
			{/if}
		</div>
	</div>

	<!-- MARK: delivery -->
	{#if !useForPreviewModal}
		<div class="flex flex-row items-center mb-4 text-gray-600">
			<span class="w-1/6 text-sm">{$tranFunc('product.delivery')}</span>
			<div class="w-5/6 text-blue-700 font-normal flex items-center">
				{#if $UserStoreManager?.addresses.length}
					<UserAddress class="w-1/2 relative!" brief address={$UserStoreManager.addresses[0]}>
						<IconButton
							icon={PencilMinus}
							rounded
							class="absolute! top-3! right-3!"
							size="xs"
							variant="light"
							disabled={$checkoutAddLineStore?.fetching}
							onclick={() => (openDeliveryModal = true)}
						/>
					</UserAddress>
				{:else}
					<div class="w-3/4">{$tranFunc('product.chooseAddress')}</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- customer policy -->
	{#if !useForPreviewModal}
		<div class="flex flex-row items-center mb-6 text-gray-600">
			<span class="w-1/6 text-sm">{$tranFunc('product.prdPolicy')}</span>
			<div class="w-5/6 flex items-center flex-wrap flex-row">
				<div class="w-2/3">
					<Alert variant="info" size="sm">{$tranFunc('product.prdPolicyDetail')}</Alert>
				</div>
			</div>
		</div>
	{/if}

	<!-- purchase button -->
	<div class="flex flex-row items-center">
		<span class="w-1/6"></span>
		<div class="w-5/6 flex items-center gap-2">
			<Button
				variant="filled"
				type="submit"
				endIcon={ShoppingBagPlus}
				onclick={handleAddVariantToCart}
				size="md"
				disabled={$checkoutAddLineStore?.fetching}
			>
				<span>{$tranFunc('product.addToCart')}</span>
			</Button>
			<Button size="md" variant="outline">{$tranFunc('product.buyNow')}</Button>
		</div>
	</div>
</div>

{#if !useForPreviewModal}
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
{/if}
