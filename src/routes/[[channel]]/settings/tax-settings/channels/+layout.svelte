<script lang="ts">
	import { page } from '$app/state';
	import { TAX_CONFIG_LIST_QUERY } from '$lib/api/admin/tax';
	import { operationStore } from '$lib/api/operation';
	import { ChevronRight, Icon } from '$lib/components/icons';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { type TabItem } from '$lib/components/ui/Tab';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type { Query, QueryTaxConfigurationsArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const TaxConfigsQuery = operationStore<
		Pick<Query, 'taxConfigurations'>,
		QueryTaxConfigurationsArgs
	>({
		kind: 'query',
		query: TAX_CONFIG_LIST_QUERY,
		variables: {
			first: 10,
		},
		requestPolicy: 'cache-and-network',
	});
</script>

{#if $TaxConfigsQuery.fetching}
	<TableSkeleton numColumns={3} numOfRows={4} />
{:else if $TaxConfigsQuery.error}
	<Alert variant="error" size="sm" bordered>{$TaxConfigsQuery.error.message}</Alert>
{:else if $TaxConfigsQuery.data?.taxConfigurations}
	{@const items: TabItem[] = $TaxConfigsQuery.data.taxConfigurations.edges.map<TabItem>((edge) => ({
  title: edge.node.channel.name,
  active: (page.url.pathname === AppRoute.TAX_SETTINGS_CHANNEL_DETAILS(edge.node.channel.id)),
  href: AppRoute.TAX_SETTINGS_CHANNEL_DETAILS(edge.node.channel.id),
}))}
	<div class="flex gap-2">
		<div class="w-2/10">
			<AccordionList header="Channels" {items}>
				{#snippet child(item)}
					<a href={item.href}>
						<div
							class={[
								'flex items-center justify-between gap-2 rounded-lg hover:bg-blue-100 hover:font-medium transition-all hover:text-blue-600 px-2 py-2',
								item.active && 'bg-blue-100 font-medium text-blue-600',
							]}
						>
							<span>{item.title}</span>
							<Icon icon={ChevronRight} size="sm" />
						</div>
					</a>
				{/snippet}
			</AccordionList>
		</div>

		<div class="w-8/10">
			{@render children()}
		</div>
	</div>
{/if}
