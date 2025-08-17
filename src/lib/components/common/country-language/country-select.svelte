<script lang="ts">
	import { tranFunc } from '$i18n';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		Select,
		SelectSkeleton,
		type SelectProps,
		type SelectOption,
	} from '$lib/components/ui/select';
	import type { Query } from '$lib/gql/graphql';

	let {
		size = 'md',
		value = $bindable(),
		class: className = '',
		label,
		...rest
	}: Omit<SelectProps, 'options'> = $props();

	const shopStore = operationStore<Pick<Query, 'shop'>>({
		kind: 'query',
		query: SHOP_QUERY,
		requestPolicy: 'cache-and-network',
	});
</script>

<div class={className}>
	{#if $shopStore.fetching}
		<SelectSkeleton {size} label={!!label} />
	{:else if $shopStore.error}
		<Alert variant="error" {size} bordered>{$shopStore.error.message}</Alert>
	{:else if $shopStore.data?.shop}
		{@const options = $shopStore.data.shop.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		}))}
		<Select
			{options}
			{size}
			{label}
			bind:value
			placeholder={$tranFunc('placeholders.valuePlaceholder')}
			{...rest}
		/>
	{/if}
</div>
