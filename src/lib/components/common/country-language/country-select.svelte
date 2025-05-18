<script lang="ts">
	import { tranFunc } from '$i18n';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		Select,
		SelectSkeleton,
		type MultiSelectProps,
		type SelectOption,
	} from '$lib/components/ui/select';
	import type { Query } from '$lib/gql/graphql';

	let { size = 'md', value, class: className = '' }: Omit<MultiSelectProps, 'options'> = $props();

	const shopStore = operationStore<Pick<Query, 'shop'>>({
		kind: 'query',
		query: SHOP_QUERY,
		requestPolicy: 'cache-first',
	});
</script>

<div class={className}>
	{#if $shopStore.fetching}
		<SelectSkeleton {size} label />
	{:else if $shopStore.error}
		<Alert variant="error" {size} bordered>{$shopStore.error.message}</Alert>
	{:else if $shopStore.data?.shop}
		{@const options = $shopStore.data.shop.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		}))}
		<Select {options} {size} bind:value placeholder={$tranFunc('placeholders.valuePlaceholder')} />
	{/if}
</div>
