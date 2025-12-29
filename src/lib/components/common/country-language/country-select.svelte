<script lang="ts">
	import { T } from '$i18n';
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

	const ShopStore = operationStore<Pick<Query, 'shop'>>({
		query: SHOP_QUERY,
		requestPolicy: 'cache-and-network',
	});
</script>

<div class={className}>
	{#if $ShopStore.fetching}
		<SelectSkeleton {size} label={!!label} />
	{:else if $ShopStore.error}
		<Alert variant="error" {size} bordered>{$ShopStore.error.message}</Alert>
	{:else if $ShopStore.data?.shop}
		{@const options = $ShopStore.data.shop.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		}))}
		<Select
			{options}
			{size}
			{label}
			bind:value
			placeholder={$T('placeholders.valuePlaceholder')}
			{...rest}
		/>
	{/if}
</div>
