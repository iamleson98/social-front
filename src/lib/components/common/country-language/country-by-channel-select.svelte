<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SocialSize } from '$lib/components/ui/common';
	import {
		MultiSelect,
		Select,
		type MultiSelectSizeType,
		type SelectOption
	} from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryChannelArgs } from '$lib/gql/graphql';

	type Props = {
		singleValue?: SelectOption['value'];
		selectType?: 'single' | 'multiple';
		size?: SocialSize;
		multiValues?: SelectOption[];
		class?: string;
		label?: string;
		channelSlug: string;
    disabled?: boolean;
	};

	let {
		singleValue = $bindable(),
		selectType = 'single',
		size = 'md',
		class: className = '',
		multiValues = $bindable([]),
		label,
		channelSlug,
    disabled
	}: Props = $props();

	if (selectType === 'multiple' && size === 'xs') size = 'sm';

	const CHANEL_STORE = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: channelSlug
		},
		requestPolicy: 'cache-and-network'
	});
</script>

<div class={className}>
	{#if $CHANEL_STORE.fetching}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-4 w-full" />
		</SkeletonContainer>
	{:else if $CHANEL_STORE.error}
		<Alert variant="error" {size} bordered>{$CHANEL_STORE.error.message}</Alert>
	{:else if $CHANEL_STORE.data?.channel?.countries}
		{@const options = $CHANEL_STORE.data.channel.countries.map<SelectOption>((item) => ({
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
        {disabled}
			/>
		{:else}
			<MultiSelect
				{options}
				size={size as MultiSelectSizeType}
				bind:value={multiValues}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				{label}
        {disabled}
			/>
		{/if}
	{/if}
</div>
