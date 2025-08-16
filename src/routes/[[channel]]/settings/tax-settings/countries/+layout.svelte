<script lang="ts">
	import { page } from '$app/state';
	import { GET_TAX_COUNTRY_CONFIGURATIONS_QUERY, TAX_CONFIG_LIST_QUERY } from '$lib/api/admin/tax';
	import { operationStore } from '$lib/api/operation';
	import { ChevronRight, Icon, Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { type TabItem } from '$lib/components/ui/Tab';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type { Query, QueryTaxCountryConfigurationArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const TaxConfigsQuery = operationStore<
		Pick<Query, 'taxCountryConfigurations'>,
		QueryTaxCountryConfigurationArgs
	>({
		kind: 'query',
		query: GET_TAX_COUNTRY_CONFIGURATIONS_QUERY,
		requestPolicy: 'cache-and-network',
	});
</script>

{#if $TaxConfigsQuery.fetching}
	<TableSkeleton numColumns={3} numOfRows={4} />
{:else if $TaxConfigsQuery.error}
	<Alert variant="error" size="sm" bordered>{$TaxConfigsQuery.error.message}</Alert>
{:else if $TaxConfigsQuery.data?.taxCountryConfigurations}
	{@const items: TabItem[] = $TaxConfigsQuery.data.taxCountryConfigurations.map<TabItem>((item) => ({
  title: item.country.country,
  active: (page.url.pathname === AppRoute.TAX_SETTINGS_COUNTRY_DETAILS(item.country.code)),
  href: AppRoute.TAX_SETTINGS_COUNTRY_DETAILS(item.country.code),
}))}
	<div class="flex gap-2">
		<div class="w-3/10">
			<AccordionList {items}>
				{#snippet header()}
					<div>
						<span>Countries</span>
						<Button size="xs" variant="light" endIcon={Plus}>Add country</Button>
					</div>
				{/snippet}
				{#snippet child(item)}
					<a href={item.href}>
						<div
							class={[
								'flex items-center justify-between gap-2 rounded-lg hover:bg-blue-100 hover:font-medium transition-all hover:text-blue-600 px-2 py-2',
								item.active && 'bg-blue-100 font-medium text-blue-600',
							]}
						>
							<span>{item.title}</span>
							{#if item.active}
								<span transition:fly={{ x: -20 }}>
									<Icon icon={ChevronRight} size="sm" />
								</span>
							{/if}
						</div>
					</a>
				{/snippet}
			</AccordionList>
		</div>

		<div class="w-7/10">
			{@render children()}
		</div>
	</div>
{/if}
