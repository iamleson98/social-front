<script lang="ts">
	import { tranFunc } from '$i18n';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select, type SelectOption, type SelectProps } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { LanguageCodeEnum, type Query } from '$lib/gql/graphql';
	import { LANGUAGE_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { onMount } from 'svelte';

	let {
		class: className = '',
		value = $bindable(),
		autoDefault,
		...rest
	}: Omit<SelectProps, 'options'> & { autoDefault?: boolean } = $props();

	const shopStore = operationStore<Pick<Query, 'shop'>>({
		kind: 'query',
		query: SHOP_QUERY,
		requestPolicy: 'cache-first'
	});

	onMount(() => {
		if (autoDefault) {
			const language = clientSideGetCookieOrDefault(LANGUAGE_KEY, LanguageCodeEnum.En);
			if (language) value = language;
		}
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
		{@const options = $shopStore.data.shop.languages.map<SelectOption>((item) => ({
			label: item.language,
			value: item.code
		}))}
		<Select {options} {...rest} bind:value placeholder={$tranFunc('placeholders.valuePlaceholder')} />
	{/if}
</div>
