<script lang="ts">
	import { CHANNELS_QUERY_STORE } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox } from '$lib/components/ui/Input';
	import RequiredAt from '$lib/components/ui/required-at.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query } from '$lib/gql/graphql';
	import { tranFunc } from '$lib/i18n';

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY_STORE,
		requestPolicy: 'cache-first'
	});

	const TODAY = new Date();
</script>

<div class="mb-3">
	<RequiredAt class="text-sm" label={$tranFunc('product.channel')} required pos="end" />

	<div class="rounded-lg bg-gray-50 p-3 border border-gray-200 flex items-start gap-2">
		{#if $channelsQueryStore.fetching}
			<SkeletonContainer class="w-1/2">
				<Skeleton class="h-6 w-full" />
			</SkeletonContainer>
		{:else if $channelsQueryStore.error}
			<Alert variant="error" size="sm" bordered>{$channelsQueryStore.error.message}</Alert>
		{:else if $channelsQueryStore.data?.channels}
			{#each $channelsQueryStore.data.channels as channel, idx (idx)}
				{@const use = {
					ok: false,
					published: true,
					publicationDate: { date: '' },
					availableForPurchase: true,
					availableDate: { date: '' }
				}}
				{#snippet channelHead()}
					<Checkbox label={channel.name} bind:checked={use.ok} size="sm" />
				{/snippet}

				<div class="w-1/3 tablet:w-1/2 mobile-l:w-full">
					<Accordion
						header={channelHead}
						open={use.ok}
						class="p-2 rounded-lg bg-white border border-gray-200"
					>
						<div class="mb-2">
							<Checkbox bind:checked={use.published} size="xs" label="Published" />
							{#if !use.published}
								<EaseDatePicker
									size="sm"
									timeConfig={{}}
									bind:value={use.publicationDate}
									allowSelectMonthYears={{
										showYears: { min: 2020 },
										showMonths: true
									}}
								/>
							{/if}
						</div>
						<div>
							<Checkbox
								bind:checked={use.availableForPurchase}
								size="xs"
								label="Available for purchase"
							/>
							{#if !use.availableForPurchase}
								<EaseDatePicker
									size="sm"
									timeConfig={{}}
									bind:value={use.availableDate}
									allowSelectMonthYears={{
										showYears: { min: 2020 },
										showMonths: true
									}}
								/>
							{/if}
						</div>
					</Accordion>
				</div>
			{/each}
		{/if}
	</div>
</div>
