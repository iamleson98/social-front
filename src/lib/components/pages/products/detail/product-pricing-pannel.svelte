<script lang="ts">
	import { goto } from '$app/navigation';
	import { T } from '$i18n';
	import { CHECKOUT_ADD_LINE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
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
		TablerRewindBackward30,
		TablerShieldCheckFilled,
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
	import {
		formatMoney,
		checkIfGraphqlResultHasError,
		SitenameCommonClassName,
	} from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { fade } from 'svelte/transition';

	interface Props {
		productInformation: Product;
		/** this component is used for product detail screen and preview modal.
		 * If `true`, only some important parts would be rendered */
		useForPreviewModal?: boolean;
	}

	const { productInformation, useForPreviewModal = false }: Props = $props();

	const productVariants = $derived(
		productInformation.productVariants?.edges?.map((edge) => edge.node) ?? [],
	);

	/** user selected variant quantity */
	let quantitySelected = $state(1);
	let selectedVariant = $state<ProductVariant>();
	let showAlertSelectVariant = $state(false);
	let openDeliveryModal = $state(false);
	const BrandAttribute = $derived(
		productInformation.attributes.find(
			(attr) => attr.attribute.slug === 'brand' && attr.values.length > 0,
		),
	);

	const quantitySelectedErr = $derived.by(() => {
		if (quantitySelected < 1 || quantitySelected % 1 !== 0) {
			return $T('error.positiveInteger');
		}
		return undefined;
	});

	const displayPrice = $derived.by(() => {
		const prdChannel = CHANNELS.find((chan) => chan.slug === productInformation.channel);
		if (!selectedVariant) {
			return formatMoney(
				productInformation.pricing?.priceRange?.start?.gross?.currency || prdChannel!.currency,
				productInformation.pricing?.priceRange?.start?.gross?.amount || 0,
				productInformation.pricing?.priceRange?.stop?.gross?.amount,
			);
		}

		return formatMoney(
			selectedVariant.pricing?.price?.gross?.currency || prdChannel!.currency,
			selectedVariant.pricing?.price?.gross?.amount || 0,
		);
	});

	/** undiscounted "original" price, used for the strike-through + saving hint */
	const originalPrice = $derived.by(() => {
		const undiscounted =
			selectedVariant?.pricing?.priceUndiscounted?.gross ??
			productInformation.pricing?.priceRangeUndiscounted?.start?.gross;
		return undiscounted?.amount ?? undefined;
	});

	const discountPercent = $derived.by(() => {
		if (!originalPrice) return 0;
		const current =
			selectedVariant?.pricing?.price?.gross?.amount ??
			productInformation.pricing?.priceRange?.start?.gross?.amount ??
			0;
		if (!originalPrice || originalPrice <= current) return 0;
		return Math.round(((originalPrice - current) / originalPrice) * 100);
	});

	const toggleSelectVariant = (variant: ProductVariant): void => {
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
		if (!checkoutAddLineStore) {
			return;
		}

		return checkoutAddLineStore.subscribe((result) => {
			// skip the initial emission that has no data yet
			if (!result.data) {
				return;
			}
			if (checkIfGraphqlResultHasError(result, 'checkoutLinesAdd')) {
				return;
			}
			checkoutStore.set(result.data?.checkoutLinesAdd?.checkout as Checkout);
			toast.success(
				$T('cart.addedToCart', { name: selectedVariant?.name || productInformation.name }),
			);
		});
	});

	/** returns the current checkout id, creating a checkout when needed */
	const ensureCheckoutId = async (): Promise<string | null> => {
		let checkout = get(checkoutStore);
		if (!checkout?.id) {
			const fetchResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
			const fetchResultParsed = await fetchResult.json();

			if (fetchResultParsed.status !== HTTPStatusSuccess || !fetchResultParsed.checkout) {
				toast.error(fetchResultParsed.message || $T('error.failedToLoad'));
				return null;
			}

			checkoutStore.set(fetchResultParsed.checkout);
			checkout = fetchResultParsed.checkout;
		}

		return checkout?.id as string;
	};

	/** adds the selected variant to the cart. returns `true` on success */
	const handleAddVariantToCart = async (): Promise<boolean> => {
		// user must select a variant before he can add it to the cart
		if (!selectedVariant) {
			showAlertSelectVariant = true;
			return false;
		}

		showAlertSelectVariant = false;

		const checkoutId = await ensureCheckoutId();
		if (!checkoutId) {
			toast.error($T('error.failedToLoad'));
			return false;
		}

		checkoutAddLineStore = operationStore<
			Pick<Mutation, 'checkoutLinesAdd'>,
			MutationCheckoutLinesAddArgs
		>({
			query: CHECKOUT_ADD_LINE_MUTATION,
			variables: {
				id: checkoutId,
				lines: [
					{
						variantId: selectedVariant.id,
						quantity: quantitySelected,
					},
				],
			},
		});

		return true;
	};

	/** add to cart then navigate to the checkout page */
	const handleBuyNow = async (): Promise<void> => {
		if (!selectedVariant) {
			showAlertSelectVariant = true;
			return;
		}
		showAlertSelectVariant = false;

		const checkoutId = await ensureCheckoutId();
		if (!checkoutId) {
			return;
		}

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutLinesAdd'>,
			MutationCheckoutLinesAddArgs
		>(CHECKOUT_ADD_LINE_MUTATION, {
			id: checkoutId,
			lines: [
				{
					variantId: selectedVariant.id,
					quantity: quantitySelected,
				},
			],
		});

		if (checkIfGraphqlResultHasError(result, 'checkoutLinesAdd')) {
			return;
		}

		checkoutStore.set(result.data?.checkoutLinesAdd?.checkout as Checkout);
		void goto(`${AppRoute.CHECKOUT()}/${checkoutId}`);
	};
</script>

<div class="{SitenameCommonClassName} h-full">
	<!-- trust badges -->
	<div class="flex flex-wrap items-center gap-1.5 mb-3">
		<Badge
			size="sm"
			startIcon={TablerShieldCheckFilled}
			text={$T('product.badgeAuthentic')}
			variant="light"
			rounded
		/>
		<Badge
			size="sm"
			startIcon={TablerRewindBackward30}
			text={$T('product.badge30DaysReturn')}
			variant="light"
			rounded
			color="grape"
		/>
		<Badge
			size="sm"
			startIcon={TablerCirclePercentage}
			text={$T('product.badgeTopDeal')}
			variant="light"
			rounded
			color="red"
		/>
		<Badge
			size="sm"
			startIcon={TruckDelivery}
			text={$T('product.badgeFreeShip')}
			variant="light"
			rounded
			color="green"
		/>
		{#if BrandAttribute}
			<Badge
				size="xs"
				text={`${$T('product.brand')}: ${BrandAttribute.values[0].name || BrandAttribute.values[0].value}`}
				variant="light"
				rounded
				color="blue"
			/>
		{/if}
	</div>

	<h1 class="text-gray-900 text-2xl max-tablet:text-xl font-bold tracking-tight mb-2">
		{productInformation.name}
	</h1>

	<div class="flex items-center text-amber-500 gap-2 mb-4">
		<Rating
			total={5}
			rating={typeof productInformation.rating === 'number' ? productInformation.rating : 0}
		>
			{#snippet slotText()}
				<p class="text-sm font-medium underline ml-1 text-gray-600">
					{typeof productInformation.rating === 'number'
						? `${productInformation.rating} / ${MAX_RATING}`
						: $T('product.noVote')}
				</p>
			{/snippet}
		</Rating>

		<div class="w-px h-6 bg-gray-200"></div>

		<IconButton
			aria-label={$T('product.reportProduct')}
			class="tooltip tooltip-bottom"
			data-tip={$T('product.reportProduct')}
			icon={TablerMessageReportFilled}
			size="xs"
			color="gray"
			variant="light"
		/>

		<div class="w-px h-6 bg-gray-200"></div>

		<IconButton
			aria-label={$T('product.contactSeller')}
			class="tooltip tooltip-bottom"
			data-tip={$T('product.contactSeller')}
			icon={TablerMessageCircleFilled}
			size="xs"
			color="blue"
			variant="light"
		/>
	</div>

	<!-- MARK: price -->
	<div
		class="mb-5 rounded-2xl px-5 py-4 bg-linear-to-br from-brand-50 to-brand-50/40 border border-brand-100"
	>
		<div class="flex flex-wrap items-end gap-x-3 gap-y-1">
			<span
				class="text-brand-700 font-extrabold text-3xl max-tablet:text-2xl leading-none tabular-nums"
			>
				{displayPrice}
			</span>

			{#if originalPrice && discountPercent > 0}
				<span class="text-gray-400 line-through text-base leading-none tabular-nums">
					{formatMoney(
						selectedVariant?.pricing?.priceUndiscounted?.gross?.currency ||
							productInformation.pricing?.priceRangeUndiscounted?.start?.gross?.currency ||
							'VND',
						originalPrice,
					)}
				</span>

				<span class="rounded-full bg-red-500 text-white text-xs font-bold px-2 py-0.5 shadow-sm">
					-{discountPercent}%
				</span>
			{/if}
		</div>

		{#if productInformation.pricing?.discount}
			{@const {
				pricing: {
					discount: {
						gross: { amount, currency },
					},
				},
			} = productInformation}

			<div class="mt-2.5">
				<Badge
					color="red"
					variant="filled"
					startIcon={Discount}
					text={formatMoney(currency, amount)}
				/>
			</div>
		{/if}
	</div>

	<!-- MARK: variants -->
	<div class="flex flex-row items-start mb-4 text-gray-600">
		<span class="w-1/6 max-tablet:w-1/3 text-sm pt-1.5">{$T('product.variants')}</span>
		<div class="w-5/6 max-tablet:w-2/3">
			<div class="flex gap-2 flex-wrap flex-row text-sm">
				{#each productVariants as variant, idx (idx)}
					{@const isVariantActive = selectedVariant?.id === variant.id}
					<button
						type="button"
						onclick={() => toggleSelectVariant(variant)}
						tabindex={0}
						disabled={!variant.quantityAvailable || $checkoutAddLineStore?.fetching}
						class={`relative rounded-xl border px-3.5 py-1.5 font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
							isVariantActive
								? 'border-brand-600 bg-brand-600! text-white shadow-sm'
								: 'border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700'
						}`}
					>
						<span class="inline-flex items-center gap-1.5">
							{variant.name}
							{#if isVariantActive}
								<Icon icon={Check} class="size-3.5" />
							{/if}
						</span>
					</button>
				{/each}
			</div>

			{#if showAlertSelectVariant}
				<div class="w-1/2 max-tablet:w-full mt-2">
					<Alert size="xs" bordered variant="warning">{$T('error.noVariantSelected')}</Alert>
				</div>
			{/if}
		</div>
	</div>

	<!-- MARK: quantity selection -->
	<div class="flex flex-row items-center mb-4 text-gray-600">
		<span class="w-1/6 max-tablet:w-1/3 text-sm">{$T('product.quantity')}</span>
		<div class="w-5/6 max-tablet:w-2/3 flex items-center flex-wrap flex-row">
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
				<span class="text-gray-500 text-sm ml-2" transition:fade={{ duration: 100 }}>
					{selectedVariant.quantityAvailable !== null &&
					selectedVariant.quantityAvailable !== undefined
						? selectedVariant.quantityAvailable <= 10
							? $T('product.lowStock', { quantity: selectedVariant.quantityAvailable })
							: $T('product.variantAvailable', { quantity: selectedVariant.quantityAvailable })
						: $T('product.outOfStock')}
				</span>
			{/if}
		</div>
	</div>

	<!-- MARK: delivery -->
	{#if !useForPreviewModal}
		<div class="flex flex-row items-center mb-4 text-gray-600">
			<span class="w-1/6 max-tablet:w-1/3 text-sm">{$T('product.delivery')}</span>
			<div class="w-5/6 max-tablet:w-2/3 text-brand-700 font-normal flex items-center">
				{#if $UserStoreManager?.addresses.length}
					<UserAddress class="w-1/2 relative! brief" address={$UserStoreManager.addresses[0]}>
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
					<div class="w-3/4">{$T('product.chooseAddress')}</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- customer policy -->
	{#if !useForPreviewModal}
		<div class="flex flex-row items-center mb-6 text-gray-600">
			<span class="w-1/6 max-tablet:w-1/3 text-sm">{$T('product.prdPolicy')}</span>
			<div class="w-5/6 max-tablet:w-2/3 flex items-center flex-wrap flex-row">
				<div class="w-2/3 max-tablet:w-full">
					<Alert variant="info" size="sm">{$T('product.prdPolicyDetail')}</Alert>
				</div>
			</div>
		</div>
	{/if}

	<!-- purchase buttons -->
	<div class="flex flex-row items-center">
		<span class="w-1/6 max-tablet:hidden"></span>
		<div class="w-5/6 max-tablet:w-full flex items-center gap-2.5 flex-wrap">
			<Button
				variant="filled"
				type="submit"
				endIcon={ShoppingBagPlus}
				onclick={handleAddVariantToCart}
				size="md"
				disabled={$checkoutAddLineStore?.fetching}
			>
				<span>{$T('product.addToCart')}</span>
			</Button>
			<Button
				size="md"
				variant="outline"
				onclick={handleBuyNow}
				disabled={$checkoutAddLineStore?.fetching}
			>
				{$T('product.buyNow')}
			</Button>
		</div>
	</div>
</div>

{#if !useForPreviewModal}
	<Modal
		open={openDeliveryModal}
		header={$T('helpText.chooseDeliveryAddress')}
		closeOnEscape
		closeOnOutsideClick
		onClose={() => (openDeliveryModal = false)}
		onCancel={() => (openDeliveryModal = false)}
		onOk={() => (openDeliveryModal = false)}
	>
		<MegaMenu items={VIETNAM_COUNTRY_UNITS} />
	</Modal>
{/if}
