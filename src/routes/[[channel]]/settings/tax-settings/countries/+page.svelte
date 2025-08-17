<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		GET_TAX_COUNTRY_CONFIGURATION_DETAIL_QUERY,
		GET_TAX_COUNTRY_CONFIGURATIONS_QUERY,
		TAX_COUNTRY_CONFIGURATION_DELETE_MUTATION,
		TAX_COUNTRY_CONFIGURATION_UPDATE_MUTATION,
	} from '$lib/api/admin/tax';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import CountrySelect from '$lib/components/common/country-language/country-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { ChevronRight, Icon, Plus } from '$lib/components/icons';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { Button } from '$lib/components/ui';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { type TabItem } from '$lib/components/ui/Tab';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type {
		CountryCode,
		Mutation,
		MutationTaxCountryConfigurationDeleteArgs,
		MutationTaxCountryConfigurationUpdateArgs,
		Query,
		QueryTaxClassesArgs,
		QueryTaxCountryConfigurationArgs,
		TaxClassRateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let taxClassCountryRatesInput = $state<TaxClassRateInput[]>([]);
	let loading = $state(false);
	const currentCountryCode = $derived(page.url.searchParams.get('code') as CountryCode);
	let openAddCountryModel = $state(false);
	let newCountryRateConfig = $state<MutationTaxCountryConfigurationUpdateArgs>();

	const TaxConfigsQuery = operationStore<Pick<Query, 'taxCountryConfigurations'>>({
		kind: 'query',
		query: GET_TAX_COUNTRY_CONFIGURATIONS_QUERY,
		requestPolicy: 'cache-and-network',
	});

	const ConfigQuery = operationStore<
		Pick<Query, 'taxCountryConfiguration'>,
		QueryTaxCountryConfigurationArgs
	>({
		kind: 'query',
		query: GET_TAX_COUNTRY_CONFIGURATION_DETAIL_QUERY,
		variables: {
			countryCode: page.url.searchParams.get('code') as CountryCode,
		},
		requestPolicy: 'cache-and-network',
		pause: !page.url.searchParams.get('code'),
	});

	const TaxClassesQuery = operationStore<Pick<Query, 'taxClasses'>, QueryTaxClassesArgs>({
		kind: 'query',
		query: TAX_CLASSES_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			first: 100,
		},
		pause: true, // only resume when user click add country tax config
	});

	onMount(() =>
		ConfigQuery.subscribe((result) => {
			if (result.data?.taxCountryConfiguration) {
				taxClassCountryRatesInput = result.data.taxCountryConfiguration.taxClassCountryRates.map(
					(item) => ({
						rate: item.rate,
						taxClassId: item.taxClass?.id,
					}),
				);
			}
		}),
	);

	onMount(() =>
		TaxConfigsQuery.subscribe((result) => {
			if (result.data?.taxCountryConfigurations?.length) {
				const firstCountryCode = result.data.taxCountryConfigurations[0].country.code;
				goto(AppRoute.TAX_SETTINGS_COUNTRY_DETAILS(firstCountryCode));
			}
		}),
	);

	onMount(() =>
		TaxClassesQuery.subscribe((result) => {
			if (result.data?.taxClasses?.edges) {
				newCountryRateConfig = {
					countryCode: '' as CountryCode,
					updateTaxClassRates: result.data.taxClasses.edges.map((item) => ({
						rate: 0,
						taxClassId: item.node.id,
					})),
				};
			}
		}),
	);

	afterNavigate(() => {
		if (currentCountryCode)
			ConfigQuery.reexecute({ variables: { countryCode: currentCountryCode } });
		else TaxConfigsQuery.reexecute({ variables: {} });
	});

	const handleClickUpdateCountryConfiguration = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'taxCountryConfigurationUpdate'>,
			MutationTaxCountryConfigurationUpdateArgs
		>(TAX_COUNTRY_CONFIGURATION_UPDATE_MUTATION, {
			countryCode: currentCountryCode,
			updateTaxClassRates: taxClassCountryRatesInput,
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'taxCountryConfigurationUpdate', CommonState.EditSuccess)
		)
			return;

		ConfigQuery.reexecute({
			variables: {
				countryCode: currentCountryCode,
			},
		});
	};

	const handleClickDeleteCountryConfiguration = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'taxCountryConfigurationDelete'>,
					MutationTaxCountryConfigurationDeleteArgs
				>(TAX_COUNTRY_CONFIGURATION_DELETE_MUTATION, {
					countryCode: currentCountryCode,
				});
				loading = false;

				if (
					checkIfGraphqlResultHasError(
						result,
						'taxCountryConfigurationDelete',
						CommonState.DeleteSuccess,
					)
				)
					return;

				await goto(AppRoute.TAX_SETTINGS_COUNTRIES());
			},
		});
	};

	const handleClickAddCountryRates = () => {
		openAddCountryModel = true;
		TaxClassesQuery.reexecute({ variables: { first: 100 } });
	};

	const handleCreateCountryRateConfig = async () => {
		if (!newCountryRateConfig) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'taxCountryConfigurationUpdate'>,
			MutationTaxCountryConfigurationUpdateArgs
		>(TAX_COUNTRY_CONFIGURATION_UPDATE_MUTATION, {
			countryCode: newCountryRateConfig!.countryCode,
			updateTaxClassRates: newCountryRateConfig!.updateTaxClassRates,
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'taxCountryConfigurationUpdate', CommonState.EditSuccess)
		)
			return;

		TaxConfigsQuery.reexecute({ variables: {} });
		openAddCountryModel = false;
	};
</script>

{#if $TaxConfigsQuery.fetching}
	<div class="flex gap-2">
		<div class="w-3/10 space-y-2">
			<TableSkeleton numColumns={1} numOfRows={4} />
		</div>
		<div class="w-7/10">
			<TableSkeleton numColumns={2} numOfRows={2} />
		</div>
	</div>
{:else if $TaxConfigsQuery.error}
	<Alert variant="error" size="sm" bordered>{$TaxConfigsQuery.error.message}</Alert>
{:else if $TaxConfigsQuery.data?.taxCountryConfigurations}
	{@const items: TabItem[] = $TaxConfigsQuery.data.taxCountryConfigurations.map<TabItem>((item) => ({
  title: item.country.country,
  active: (page.url.searchParams.get('code') === item.country.code),
  href: AppRoute.TAX_SETTINGS_COUNTRY_DETAILS(item.country.code),
}))}
	<div class="flex gap-2">
		<div class="w-3/10 space-y-2">
			{#if items.length}
				<AccordionList header="Countries" {items} class={SitenameCommonClassName}>
					{#snippet child(item)}
						<a href={item.href}>
							<div
								class={[
									'flex items-center justify-between gap-2 rounded-lg hover:bg-blue-100 transition-all hover:text-blue-600 px-2 py-2',
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
			{:else}
				<Alert size="sm" bordered>No countries found. Please add more</Alert>
			{/if}

			<Button
				size="sm"
				fullWidth
				endIcon={Plus}
				onclick={handleClickAddCountryRates}
				disabled={loading}
			>
				Add country
			</Button>
		</div>

		<div class="w-7/10">
			{#if !$TaxConfigsQuery.data?.taxCountryConfigurations.length || $ConfigQuery.fetching}
				<TableSkeleton numColumns={2} numOfRows={2} />
			{:else if $ConfigQuery.error}
				<Alert variant="error" size="sm" bordered>{$ConfigQuery.error.message}</Alert>
			{:else if $ConfigQuery.data?.taxCountryConfiguration}
				{@const { country, taxClassCountryRates } = $ConfigQuery.data.taxCountryConfiguration}
				<div class={SitenameCommonClassName}>
					<SectionHeader>{country.country} class rates</SectionHeader>

					<div
						class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-200"
					>
						<div class="flex-1/2">Tax name</div>
						<div class="flex-1/2">Tax rate</div>
					</div>

					{#each taxClassCountryRatesInput as taxClassCountryRate, idx (idx)}
						{@const rateName = taxClassCountryRates[idx].taxClass?.name || 'Country default rate'}
						<div class="flex items-center gap-2">
							<div class="flex-1/2 text-sm">{rateName}</div>
							<div class="flex-1/2 text-center">
								<Input
									placeholder="Enter rate"
									type="number"
									bind:value={taxClassCountryRate.rate}
									disabled={loading}
									min={0}
									max={100}
								>
									{#snippet action()}
										<span class="text-gray-500 font-bold text-xs">%</span>
									{/snippet}
								</Input>
							</div>
						</div>
					{/each}
				</div>

				<ActionBar
					onUpdateClick={handleClickUpdateCountryConfiguration}
					backButtonUrl={AppRoute.TAX_SETTINGS_COUNTRIES()}
					disabled={loading}
					onDeleteClick={handleClickDeleteCountryConfiguration}
				/>
			{/if}
		</div>
	</div>
{/if}

<Modal
	open={openAddCountryModel}
	onClose={() => (openAddCountryModel = false)}
	header="Add country rate config"
	size="sm"
	onCancel={() => (openAddCountryModel = false)}
	onOk={handleCreateCountryRateConfig}
	closeOnEscape
	closeOnOutsideClick
	disableElements={loading}
>
	<div class="space-y-2">
		{#if $TaxClassesQuery.fetching}
			<SelectSkeleton label />
			<SelectSkeleton label />
		{:else if $TaxClassesQuery.error}
			<Alert variant="error" size="sm" bordered>{$TaxClassesQuery.error.message}</Alert>
		{:else if $TaxClassesQuery.data?.taxClasses?.edges}
			<CountrySelect bind:value={newCountryRateConfig!.countryCode} disabled={loading} />

			{#each newCountryRateConfig?.updateTaxClassRates || [] as taxClassRate, idx (idx)}
				{@const className = $TaxClassesQuery.data.taxClasses.edges[idx].node.name}
				<div class="grid grid-cols-2 gap-2 items-center">
					<span class="text-sm font-semibold text-gray-700">{className}</span>
					<Input
						type="number"
						placeholder="Rate"
						bind:value={taxClassRate.rate}
						min={0}
						max={100}
						disabled={loading}
					>
						{#snippet action()}
							<span class="text-gray-500 font-bold text-xs">%</span>
						{/snippet}
					</Input>
				</div>
			{/each}
		{/if}
	</div>
</Modal>
