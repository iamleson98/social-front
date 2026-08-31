<script lang="ts">
	import { CHECKOUT_REMOVE_PROMO_CODE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import type { LanguageCodeEnum } from '$lib/gql/graphql';
	import {
		type Maybe,
		type Money as MoneyType,
		type Mutation,
		type MutationCheckoutRemovePromoCodeArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import Money from './money.svelte';

	interface Props {
		editable?: boolean;
		negative?: boolean;
		money?: Maybe<MoneyType>;
		label: string;
		ariaLabel: string;
		promoCode?: string;
		promoCodeId?: string;
		checkoutId: string;
		/** called after the promo code has been removed so the parent can refresh totals */
		onCheckoutUpdated?: () => void;
	}

	type CustomMutationCheckoutRemovePromoCodeArgs = {
		languageCode?: LanguageCodeEnum;
	} & MutationCheckoutRemovePromoCodeArgs;

	const {
		label,
		money,
		editable,
		checkoutId,
		ariaLabel,
		promoCode,
		promoCodeId,
		negative,
		onCheckoutUpdated,
	}: Props = $props();

	let loading = $state(false);

	const handleDeletePromocode = async (): Promise<void> => {
		loading = true;

		const variables: CustomMutationCheckoutRemovePromoCodeArgs = promoCode
			? { promoCode }
			: { promoCodeId };
		variables.checkoutId = checkoutId;

		const removeResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutRemovePromoCode'>,
			CustomMutationCheckoutRemovePromoCodeArgs
		>(CHECKOUT_REMOVE_PROMO_CODE_MUTATION, variables);

		loading = false;

		if (
			checkIfGraphqlResultHasError(removeResult, 'checkoutRemovePromoCode', 'Promo code removed')
		) {
			return;
		}

		onCheckoutUpdated?.();
	};
</script>

<div class="mb-2 flex flex-row items-center justify-between">
	<div class="flex flex-row items-center">
		<p class="text-sm font-semibold">{label}</p>
		{#if editable}
			<div>
				<IconButton
					icon={Trash}
					size="sm"
					variant="light"
					color="red"
					onclick={handleDeletePromocode}
					{loading}
				/>
			</div>
		{/if}
	</div>

	<Money {money} {ariaLabel} {negative} />
</div>
