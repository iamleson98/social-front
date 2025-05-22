<script lang="ts">
	import {
		LanguageCodeEnum,
		type Maybe,
		type Money as MoneyType,
		type Mutation,
		type MutationCheckoutRemovePromoCodeArgs
	} from '$lib/gql/graphql';
	import Money from './money.svelte';
	import { IconButton } from '$lib/components/ui/Button';
	import { Trash } from '$lib/components/icons';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { CHECKOUT_REMOVE_PROMO_CODE_MUTATION } from '$lib/api/checkout';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	type Props = {
		editable?: boolean;
		negative?: boolean;
		money?: Maybe<MoneyType>;
		label: string;
		ariaLabel: string;
		promoCode?: string;
		promoCodeId?: string;
		checkoutId: string;
	};

	type CustomMutationCheckoutRemovePromoCodeArgs = {
		languageCode?: LanguageCodeEnum;
	} & MutationCheckoutRemovePromoCodeArgs;

	let { label, money, editable, checkoutId, ariaLabel, promoCode, promoCodeId }: Props = $props();

	let loading = $state(false);

	const handleDeletePromocode = async () => {
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
		)
			return;
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

	<Money {money} {ariaLabel} />
</div>
