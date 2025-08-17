<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import {
		Select,
		SelectSkeleton,
		type SelectOption,
		type SelectProps,
	} from '$lib/components/ui/select';
	import type { Query } from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';
	import { Alert } from '$lib/components/ui/Alert';
	import { onMount } from 'svelte';

	type QueryShopArgs = {
		isStaffUser?: boolean;
	};

	let { size, label, value = $bindable(), ...rest }: Omit<SelectProps, 'options'> = $props();

	const shopStore = operationStore<Pick<Query, 'shop'>, QueryShopArgs>({
		query: SHOP_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			isStaffUser: false,
		},
		pause: true,
	});

	onMount(() =>
		READ_ONLY_USER_STORE.subscribe((user) => {
			const isStaffUser = !!user && user.isStaff;

			shopStore.reexecute({ variables: { isStaffUser } });
		}),
	);
</script>

{#if $shopStore.fetching}
	<SelectSkeleton {size} label={!!label} />
{:else if $shopStore.error}
	<Alert {size} variant="error" bordered>{$shopStore.error.message}</Alert>
{:else if $shopStore.data}
	{@const options =
		$shopStore.data.shop.channelCurrencies?.map<SelectOption>((cur) => ({
			value: cur,
			label: cur,
		})) || []}
	<Select {label} {size} {options} {...rest} bind:value />
{/if}
