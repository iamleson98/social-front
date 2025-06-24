<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { CREATE_DRAFT_ORDER_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import type { Mutation, MutationDraftOrderCreateArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let loading = $state(false);

	const handleClickCreateOrder: MouseEventHandler<HTMLButtonElement> = async (evt) => {
		evt.preventDefault();

		loading = true;

		// const result = await GRAPHQL_CLIENT.mutation<
		// 	Pick<Mutation, 'draftOrderCreate'>,
		// 	MutationDraftOrderCreateArgs
		// >(CREATE_DRAFT_ORDER_MUTATION, {
		// 	input: {},
		// });

		// loading = false;

		// if (
		// 	checkIfGraphqlResultHasError(
		// 		result,
		// 		'draftOrderCreate',
		// 		'Navigating you to order creation page...',
		// 	)
		// )
		// 	return;

		// await goto(AppRoute.SETTINGS_ORDERS_NEW());
	};
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_ORDERS()}
	listingPageLabel={$tranFunc('settings.orders')}
	newPageHref={AppRoute.SETTINGS_ORDERS_NEW()}
	newPageLabel={$tranFunc('settings.newOrder')}
	detailRouteID="/[[channel]]/settings/shop-orders/[id]"
	detailPageLabelGetter={(page) => page.params.id}
	onNewPageBtnClick={handleClickCreateOrder}
	disabled={loading}
/>

<div>
	{@render children()}
</div>
