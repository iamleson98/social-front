<script lang="ts">
	import { T } from '$i18n';
	import {
		CHECKOUT_LINES_DELETE_MUTATION,
		CHECKOUT_LINES_UPDATE_MUTATION,
	} from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Minus, Plus, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import type {
		Checkout,
		CheckoutLine,
		Mutation,
		MutationCheckoutLinesDeleteArgs,
		MutationCheckoutLinesUpdateArgs,
	} from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { AppRoute } from '$lib/utils';
	import { formatMoney, checkIfGraphqlResultHasError } from '$lib/utils/utils';

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
		loading = true;

		const deleteResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutLinesDelete'>,
			MutationCheckoutLinesDeleteArgs
		>(CHECKOUT_LINES_DELETE_MUTATION, {
			linesIds: [line.id],
			id: checkoutId,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(deleteResult, 'checkoutLinesDelete')) return;

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

		loading = true;

		const updateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutLinesUpdate'>,
			MutationCheckoutLinesUpdateArgs
		>(CHECKOUT_LINES_UPDATE_MUTATION, {
			lines: [{ lineId: line.id, quantity }],
			id: checkoutId,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(updateResult, 'checkoutLinesUpdate')) return;

		checkoutStore.set(updateResult.data?.checkoutLinesUpdate?.checkout as Checkout);
	};

	const handleItemQuantityInput = () => {
		let timeout: ReturnType<typeof setTimeout>;

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
		let timeout: ReturnType<typeof setTimeout>;

		return () => {
			quantity += delta;

			clearTimeout(timeout);
			if (quantity <= 0) {
				// keep the value at 1 — removal is done via the explicit trash button
				quantity = 1;
				return;
			}
			if (!validateQuantity(quantity)) return;

			timeout = setTimeout(handleUpdateCheckoutLine, DEBOUNCE_TIME);
		};
	};
</script>

<div class="card-surface p-4 w-full mb-2 overflow-hidden transition-shadow hover:shadow-md">
	<div class="flex items-center gap-3 max-tablet:gap-2">
		<!-- MARK: IMAGE -->
		<div class="shrink-0">
			<img
				src={mediaUrl}
				alt={mediaAlt}
				class="w-18 h-18 max-tablet:w-14 max-tablet:h-14 object-cover rounded-xl border border-gray-100"
				loading="lazy"
			/>
		</div>

		<!-- MARK: NAME -->
		<div class="flex-1 min-w-0">
			<a
				href={AppRoute.PRODUCT_DETAILS(line.variant.product.slug)}
				class="text-gray-800 font-medium text-md line-clamp-2 hover:text-brand-700 transition-colors"
			>
				{line.variant.product.name}
			</a>
			{#if line.variant.name && line.variant.name !== line.variant.product.name}
				<p class="text-xs text-gray-500 mt-0.5 truncate">{line.variant.name}</p>
			{/if}
		</div>

		<!-- MARK: QUANTITY -->
		<div class="flex items-center gap-2 shrink-0 max-tablet:gap-1">
			<div class="flex items-center gap-1">
				<IconButton
					icon={Minus}
					size="sm"
					color="red"
					variant="light"
					onclick={handleQuantityBtnClick(-1)}
					disabled={quantity <= 1 || loading}
					aria-label="decrease quantity"
				/>
				<Input
					size="sm"
					bind:value={quantity}
					min={1}
					oninput={handleItemQuantityInput()}
					type="number"
					class="w-16! text-center"
					disabled={loading}
					aria-label="quantity"
				/>
				<IconButton
					icon={Plus}
					size="sm"
					variant="light"
					onclick={handleQuantityBtnClick(1)}
					disabled={(typeof QUANTITY_LIMIT === 'number' && QUANTITY_LIMIT <= quantity) || loading}
					aria-label="increase quantity"
				/>
			</div>
		</div>

		<!-- MARK: LINE TOTAL + REMOVE -->
		<div class="flex items-center gap-2 shrink-0 w-32 max-tablet:w-24 justify-end">
			{#if loading}
				<SkeletonContainer>
					<Skeleton class="w-12 h-3" />
				</SkeletonContainer>
			{:else}
				<span class="text-brand-700 font-semibold tabular-nums whitespace-nowrap">
					{formatMoney(line.totalPrice.gross.currency, line.totalPrice.gross.amount)}
				</span>
			{/if}

			<IconButton
				icon={Trash}
				size="sm"
				color="red"
				variant="light"
				onclick={handleDeleteCheckoutLine}
				disabled={loading}
				aria-label="remove from cart"
				class="tooltip tooltip-left"
				data-tip={$T('btn.delete')}
			/>
		</div>
	</div>
</div>
