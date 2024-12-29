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
	import { graphqlClient } from '$lib/client';
	import { CHECKOUT_REMOVE_PROMO_CODE_MUTATION } from '$lib/stores/api/checkout';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { toastStore } from '$lib/stores/ui/toast';

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

		const removeResult = await graphqlClient
			.mutation<
				Pick<Mutation, 'checkoutRemovePromoCode'>,
				CustomMutationCheckoutRemovePromoCodeArgs
			>(CHECKOUT_REMOVE_PROMO_CODE_MUTATION, variables)
			.toPromise();

		loading = false;

		if (preHandleGraphqlResult(removeResult)) return;

		toastStore.send({
			message: 'Promo code removed',
			variant: 'success'
		});
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
