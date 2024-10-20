<script lang="ts">
	import { tClient } from '$i18n';
	import { graphqlClient } from '$lib/client';
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
	} from '$lib/stores/api/checkout';
	import { checkoutStore } from '$lib/stores/app';
	import { alertStore } from '$lib/stores/ui/alert-modal';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { formatMoney, preHandleGraphqlResult } from '$lib/utils/utils';
	import { tick } from 'svelte';

	type Props = {
		line: CheckoutLine;
		checkoutId: string;
	};

	let { line, checkoutId }: Props = $props();

	const { quantityAvailable, quantityLimitPerCustomer } = line.variant;
	const QUANTITY_LIMIT = quantityLimitPerCustomer || quantityAvailable;
	const DEBOUNCE_TIME = 888;

	let quantity = $state(line.quantity);

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
		const deleteResult = await graphqlClient
			.mutation<Pick<Mutation, 'checkoutLinesDelete'>, MutationCheckoutLinesDeleteArgs>(
				CHECKOUT_LINES_DELETE_MUTATION,
				{
					linesIds: [line.id],
					id: checkoutId
				}
			)
			.toPromise();

		if (preHandleGraphqlResult(deleteResult)) return;
		if (deleteResult.data?.checkoutLinesDelete?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: deleteResult.data.checkoutLinesDelete.errors[0].message as string
			});
			return;
		}

		checkoutStore.set(deleteResult.data?.checkoutLinesDelete?.checkout as Checkout);
	};

	/** returns `true` means it's ok to set new quantity, `false` otherwise */
	const validateQuantity = (newQuantity: number) => {
		return newQuantity > 0 && (!QUANTITY_LIMIT || newQuantity <= QUANTITY_LIMIT);
	};

	const handleUpdateCheckoutLine = async () => {
		await tick();
		if (!validateQuantity(quantity)) return;

		const updateResult = await graphqlClient
			.mutation<Pick<Mutation, 'checkoutLinesUpdate'>, MutationCheckoutLinesUpdateArgs>(
				CHECKOUT_LINES_UPDATE_MUTATION,
				{
					lines: [{ lineId: line.id, quantity }],
					id: checkoutId
				}
			)
			.toPromise();

		if (preHandleGraphqlResult(updateResult)) return;
		if (updateResult.data?.checkoutLinesUpdate?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: updateResult.data.checkoutLinesUpdate.errors[0].message as string
			});
			return;
		}

		checkoutStore.set(updateResult.data?.checkoutLinesUpdate?.checkout as Checkout);
	};

	const handleItemQuantityInput = (evt: Event) => {
		const { value } = evt.target as HTMLInputElement;
		const newQuantity = Math.round(Number(value));
		if (validateQuantity(newQuantity)) {
			quantity = newQuantity;
		}
	};

	$effect(() => {
		if (quantity <= 0) {
			alertStore.openAlertModal({
				content: tClient('common.confirmRemoveProduct'),
				onOk: handleDeleteCheckoutLine,
				onCancel: () => (quantity = 1)
			});
		}
	});
</script>

<div class="bg-white rounded-md p-4 w-full border mb-2">
	<div class="flex items-center gap-2">
		<img src={mediaUrl} alt={mediaAlt} class="w-16 h-16 object-cover rounded overflow-hidden" />
		<div class="flex-1">
			<a
				href={`${AppRoute.PRODUCTS}/${encodeURIComponent(line.variant.product.slug)}`}
				class="text-gray-800 text-md hover:underline"
			>
				{line.variant.product.name}
			</a>
			<div class="flex items-center text-gray-500 text-xs mt-2 gap-2"></div>
		</div>
		<div class="flex items-center gap-2">
			<IconButton
				icon={Minus}
				size="sm"
				color="red"
				variant="light"
				onclick={() => quantity--}
				disabled={quantity <= 0}
				clickDebounceOptions={{
					onInput: handleUpdateCheckoutLine,
					debounceTime: DEBOUNCE_TIME
				}}
			/>
			<Input
				size="sm"
				bind:value={quantity}
				min={0}
				oninput={handleItemQuantityInput}
				type="number"
				class="!w-16"
			/>
			<IconButton
				icon={Plus}
				size="sm"
				variant="light"
				clickDebounceOptions={{
					onInput: handleUpdateCheckoutLine,
					debounceTime: DEBOUNCE_TIME
				}}
				onclick={() => quantity++}
				disabled={typeof QUANTITY_LIMIT === 'number' && QUANTITY_LIMIT <= quantity}
			/>
		</div>
		<span class="text-gray-800 font-bold">
			{formatMoney(line.totalPrice.gross.currency, line.totalPrice.gross.amount)}
		</span>
	</div>
</div>
