<script lang="ts">
	import { tranFunc } from '$i18n';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SocialSize } from '$lib/components/ui/common';
	import {
		MultiSelect,
		Select,
		type MultiSelectSizeType,
		type SelectOption
	} from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query } from '$lib/gql/graphql';

	type Props = {
		singleValue?: SelectOption['value'];
		selectType?: 'single' | 'multiple';
		size?: SocialSize;
		multiValues?: SelectOption[];
		class?: string;
		label?: string;
	};

	let {
		singleValue = $bindable(),
		selectType = 'single',
		size = 'md',
		class: className = '',
		multiValues = $bindable([]),
		label,
	}: Props = $props();

	if (selectType === 'multiple' && size === 'xs') size = 'sm';

	const shopStore = operationStore<Pick<Query, 'shop'>>({
		kind: 'query',
		query: SHOP_QUERY,
		requestPolicy: 'cache-first'
	});
</script>

<div class={className}>
	{#if $shopStore.fetching}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-4 w-full" />
		</SkeletonContainer>
	{:else if $shopStore.error}
		<Alert variant="error" size="sm" bordered>{$shopStore.error.message}</Alert>
	{:else if $shopStore.data?.shop}
		{@const options = $shopStore.data.shop.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code
		}))}
		{#if selectType === 'single'}
			<Select
				{options}
				{size}
				bind:value={singleValue}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				{label}
			/>
		{:else}
			<MultiSelect
				{options}
				size={size as MultiSelectSizeType}
				bind:value={multiValues}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				{label}
			/>
		{/if}
	{/if}
</div>
