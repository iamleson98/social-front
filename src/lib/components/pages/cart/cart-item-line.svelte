<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Minus, Plus } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import type {
		Checkout,
		CheckoutLine,
		Mutation,
		MutationCheckoutLinesDeleteArgs,
		MutationCheckoutLinesUpdateArgs
	} from '$lib/gql/graphql';
	import {
		CHECKOUT_LINES_DELETE_MUTATION,
		CHECKOUT_LINES_UPDATE_MUTATION
	} from '$lib/api/checkout';
	import { checkoutStore } from '$lib/stores/app';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { AppRoute } from '$lib/utils';
	import { formatMoney, preHandleErrorOnGraphqlResult } from '$lib/utils/utils';

	type Props = {
		line: CheckoutLine;
		checkoutId: string;
	};

	let { line, checkoutId }: Props = $props();

	const { quantityAvailable, quantityLimitPerCustomer } = line.variant;
	const QUANTITY_LIMIT = quantityLimitPerCustomer || quantityAvailable || 0;
	const DEBOUNCE_TIME = 888;

	let quantity = $state(line.quantity);
	let loading = $state(false);

	const mediaUrl = $derived.by(() => {
		if (line.variant.media?.length) return line.variant.media[0].url;
		if (line.variant.product.media?.length) return line.variant.product.media[0].url;
		return defaultSlideShowState.medias[0].url;
	});

	const mediaAlt = $derived.by(() => {
		if (line.variant.media?.length) return line.variant.media[0].alt;
		if (line.variant.product.media?.length) return line.variant.product.media[0].alt;
		return defaultSlideShowState.medias[0].alt;
	});

	const handleDeleteCheckoutLine = async () => {
		loading = true; //

		const deleteResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutLinesDelete'>,
			MutationCheckoutLinesDeleteArgs
		>(CHECKOUT_LINES_DELETE_MUTATION, {
			linesIds: [line.id],
			id: checkoutId
		});

		loading = false; //

		if (preHandleErrorOnGraphqlResult(deleteResult, 'checkoutLinesDelete')) return;

		checkoutStore.set(deleteResult.data?.checkoutLinesDelete?.checkout as Checkout);
	};

	/** returns `true` means it's ok to set new quantity, `false` otherwise */
	const validateQuantity = (newQuantity: unknown) => {
		return (
			typeof newQuantity === 'number' &&
			newQuantity > 0 &&
			(!QUANTITY_LIMIT || newQuantity <= QUANTITY_LIMIT)
		);
	};

	const handleUpdateCheckoutLine = async () => {
		if (!validateQuantity(quantity)) return;

		loading = true; //

		const updateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutLinesUpdate'>,
			MutationCheckoutLinesUpdateArgs
		>(CHECKOUT_LINES_UPDATE_MUTATION, {
			lines: [{ lineId: line.id, quantity }],
			id: checkoutId
		});

		loading = false; //

		if (preHandleErrorOnGraphqlResult(updateResult, 'checkoutLinesUpdate')) return;

		checkoutStore.set(updateResult.data?.checkoutLinesUpdate?.checkout as Checkout);
	};

	const handleItemQuantityInput = () => {
		let timeout: any;

		return (evt: Event) => {
			const { value } = evt.target as HTMLInputElement;
			const newQuantity = Math.round(Number(value));

			clearTimeout(timeout);
			if (!validateQuantity(newQuantity)) return;

			quantity = newQuantity;
			timeout = setTimeout(handleUpdateCheckoutLine, DEBOUNCE_TIME);
		};
	};

	const handleQuantityBtnClick = (delta: -1 | 1) => {
		let timeout: any;

		return () => {
			quantity += delta;

			clearTimeout(timeout);
			if (!validateQuantity(quantity)) return;

			timeout = setTimeout(handleUpdateCheckoutLine, DEBOUNCE_TIME);
		};
	};

	$effect(() => {
		// in case user want to remove the item
		if (quantity <= 0) {
			ALERT_MODAL_STORE.openAlertModal({
				content: $tranFunc('common.confirmRemoveProduct'),
				onOk: handleDeleteCheckoutLine,
				onCancel: () => {
					quantity = 1;
					handleUpdateCheckoutLine();
				}
			});
		}
	});
</script>

<div class="bg-white rounded-lg p-4 w-full border mb-2 overflow-hidden">
	<div class="flex items-center gap-2">
		<!-- MARK: IMAGE -->
		<div class="w-1/12">
			<img
				src={mediaUrl}
				alt={mediaAlt}
				class="w-16 h-16 object-cover rounded-sm overflow-hidden"
			/>
		</div>

		<!-- MARK: NAME -->
		<div class="w-8/12">
			<a
				href={AppRoute.PRODUCT_DETAILS(line.variant.product.slug)}
				class="text-gray-800 text-md hover:underline"
			>
				{line.variant.product.name}
			</a>
		</div>

		<!-- MARK: QUANTITY -->
		<div class="flex items-center gap-2 w-4/12">
			<div class="flex items-center gap-2">
				<IconButton
					icon={Minus}
					size="sm"
					color="red"
					variant="light"
					onclick={handleQuantityBtnClick(-1)}
					disabled={quantity <= 0 || loading}
				/>
				<Input
					size="sm"
					bind:value={quantity}
					min={0}
					oninput={handleItemQuantityInput()}
					type="number"
					class="w-16!"
					disabled={loading}
				/>
				<IconButton
					icon={Plus}
					size="sm"
					variant="light"
					onclick={handleQuantityBtnClick(1)}
					disabled={(typeof QUANTITY_LIMIT === 'number' && QUANTITY_LIMIT <= quantity) || loading}
				/>
			</div>

			<!-- total price of line -->
			{#if loading}
				<SkeletonContainer>
					<Skeleton class="w-12 h-3" />
				</SkeletonContainer>
			{:else}
				<span class="text-blue-700 font-semibold">
					{formatMoney(line.totalPrice.gross.currency, line.totalPrice.gross.amount)}
				</span>
			{/if}
		</div>
	</div>
</div>
