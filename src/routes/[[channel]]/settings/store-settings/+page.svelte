<script lang="ts">
	import { page } from '$app/state';
	import { SHOP_UPDATE_MUTATION } from '$lib/api/admin/shop';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import AddressForm from '$lib/components/pages/checkout/address-form.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input, Toggle } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		type Address,
		type AddressInput,
		type Mutation,
		type MutationShopSettingsUpdateArgs,
		type Query,
		type ShopSettingsInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { noop, pick } from 'es-toolkit';
	import { onMount } from 'svelte';

	const ShopDetailQuery = operationStore<Pick<Query, 'shop'>>({
		query: SHOP_QUERY,
		requestPolicy: 'cache-first',
		variables: {
			isStaffUser: true, // we already checked for this in the load function
		},
	});

	let shopInput = $state<ShopSettingsInput>({
		reserveStockDurationAuthenticatedUser: undefined,
		reserveStockDurationAnonymousUser: undefined,
		limitQuantityPerCheckout: 0,
		enableAccountConfirmationByEmail: false,
	});
	let loading = $state(false);
	let shopAddressInput = $state<AddressInput>({});

	onMount(() =>
		ShopDetailQuery.subscribe((result) => {
			if (result.data?.shop) {
				shopInput = {
					...shopInput,
					...pick(result.data.shop, [
						'reserveStockDurationAuthenticatedUser',
						'reserveStockDurationAnonymousUser',
						'limitQuantityPerCheckout',
						'enableAccountConfirmationByEmail',
					]),
				};
			}
		}),
	);

	const handleUpdateStore = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'shopSettingsUpdate'>,
			MutationShopSettingsUpdateArgs
		>(SHOP_UPDATE_MUTATION, {
			input: shopInput,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'shopSettingsUpdate', CommonState.EditSuccess)) return;

		ShopDetailQuery.reexecute({
			variables: {
				isStaffUser: true,
			},
		});
	};
</script>

{#if $ShopDetailQuery.fetching}
	<div class={SitenameCommonClassName}>
		<SelectSkeleton label />
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>
{:else if $ShopDetailQuery.error}
	<Alert variant="error" size="sm" bordered>{$ShopDetailQuery.error.message}</Alert>
{:else if $ShopDetailQuery.data?.shop}
	{@const { companyAddress } = $ShopDetailQuery.data.shop}
	<div class="space-y-2">
		<div class={SitenameCommonClassName}>
			<SectionHeader>Reserved stock</SectionHeader>

			<Alert variant="info" size="sm" bordered>
				Set up time amount that stock in checkout is reserved for the customer. You can set separate
				values for authenticated and anonymous customers.
			</Alert>

			<div class="grid grid-cols-2 gap-2">
				<Input
					type="number"
					label="Stock reserved duration for authenticated users (mins)"
					placeholder="Enter value"
					bind:value={shopInput.reserveStockDurationAuthenticatedUser}
					subText="Leaving this setting empty will mean that stock won't be reserved"
					disabled={loading}
				/>
				<Input
					type="number"
					label="Stock reserved duration for anonymous users (mins)"
					placeholder="Enter value"
					bind:value={shopInput.reserveStockDurationAnonymousUser}
					subText="Leaving this setting empty will mean that stock won't be reserved"
					disabled={loading}
				/>

				<Input
					type="number"
					label="Checkout line limit"
					placeholder="Enter value"
					bind:value={shopInput.limitQuantityPerCheckout}
					subText="This number defines quantity of items in checkout line that can be bought. You can override this setting per variant. Leaving this setting empty mean that there is no limits."
					disabled={loading}
				/>
			</div>

			<Toggle
				label="Require email confirmation link"
				bind:checked={shopInput.enableAccountConfirmationByEmail}
				disabled={loading}
			/>
		</div>

		<!-- Address -->
		<div class={SitenameCommonClassName}>
			<SectionHeader>Shop Address</SectionHeader>
			<AddressForm
				defaultValue={companyAddress as Address}
				channelSlug={page.params.channel!}
				onSubmit={noop}
				onCancel={noop}
				updatingCheckoutAddresses={false}
			/>
		</div>
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS()}
		onUpdateClick={handleUpdateStore}
		disableUpdateButton={loading}
		disabled={loading}
	/>
{/if}
