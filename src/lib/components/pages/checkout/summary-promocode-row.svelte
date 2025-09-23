<script lang="ts">
	import { CHECKOUT_REMOVE_PROMO_CODE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import {
		LanguageCodeEnum,
		type Maybe,
		type Money as MoneyType,
		type Mutation,
		type MutationCheckoutRemovePromoCodeArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import Money from './money.svelte';

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

		if (checkIfGraphqlResultHasError(removeResult, 'checkoutRemovePromoCode', 'Promo code removed'))
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
