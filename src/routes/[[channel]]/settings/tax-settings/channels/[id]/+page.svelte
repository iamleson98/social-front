<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { TAX_CONFIG_DETAIL_QUERY, TAX_CONFIG_UPDATE_MUTATION } from '$lib/api/admin/tax';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { Button } from '$lib/components/ui';
	import Alert from '$lib/components/ui/Alert/alert.svelte';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import {
		CountryCode,
		TaxCalculationStrategy,
		type Mutation,
		type MutationTaxConfigurationUpdateArgs,
		type Query,
		type QueryTaxConfigurationArgs,
		type TaxConfigurationPerCountryInput,
		type TaxConfigurationUpdateInput,
	} from '$lib/gql/graphql';
	import { READ_ONLY_SHOP_STORE } from '$lib/stores/shop';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import {
		addNoDup,
		checkIfGraphqlResultHasError,
		SitenameCommonClassName,
	} from '$lib/utils/utils';
	import { omit, pick } from 'es-toolkit';
	import { onMount } from 'svelte';

	const TaxConfigQuery = operationStore<Pick<Query, 'taxConfiguration'>, QueryTaxConfigurationArgs>(
		{
			kind: 'query',
			query: TAX_CONFIG_DETAIL_QUERY,
			variables: {
				id: page.params.id!,
			},
			requestPolicy: 'cache-and-network',
			pause: !page.params.id,
		},
	);

	const TaxStrategies = [TaxCalculationStrategy.FlatRates, TaxCalculationStrategy.TaxApp].map(
		(value) => ({
			value,
			label: value.toLowerCase().replace(/_/g, ' '),
		}),
	);

	const Countries =
		$READ_ONLY_SHOP_STORE?.countries.map<SelectOption>((country) => ({
			value: country.code,
			label: country.country,
		})) || [];

	let taxConfigInput = $state<TaxConfigurationUpdateInput>({
		chargeTaxes: false,
		taxCalculationStrategy: TaxCalculationStrategy.FlatRates,
		pricesEnteredWithTax: false,
		displayGrossPrices: false,
		updateCountriesConfiguration: [],
		removeCountriesConfiguration: [],
	});
	let loading = $state(false);

	onMount(() =>
		TaxConfigQuery.subscribe((result) => {
			if (result.data?.taxConfiguration) {
				taxConfigInput = {
					...taxConfigInput,
					...pick(result.data.taxConfiguration, [
						'chargeTaxes',
						'taxCalculationStrategy',
						'pricesEnteredWithTax',
						'displayGrossPrices',
					]),
					updateCountriesConfiguration:
						result.data.taxConfiguration.countries.map<TaxConfigurationPerCountryInput>((item) => ({
							chargeTaxes: item.chargeTaxes,
							countryCode: item.country.code as CountryCode,
							displayGrossPrices: item.displayGrossPrices,
							taxCalculationStrategy: item.taxCalculationStrategy,
							taxAppId: item.taxAppId,
							existing: true, // NOTE: This is used to identify if the country is existing or new
						})),
					removeCountriesConfiguration: [],
				};
			}
		}),
	);

	afterNavigate(() => {
		TaxConfigQuery.reexecute({
			variables: { id: page.params.id! },
		});
	});

	const handleDeleteCountry = (item: TaxConfigurationPerCountryInput) => {
		if (item['existing' as keyof TaxConfigurationPerCountryInput]) {
			taxConfigInput.removeCountriesConfiguration = addNoDup(
				taxConfigInput.removeCountriesConfiguration!,
				item.countryCode,
			);
		}
		taxConfigInput.updateCountriesConfiguration =
			taxConfigInput.updateCountriesConfiguration!.filter(
				(country) => country.countryCode !== item.countryCode,
			);
	};

	const handleAddCountryClick = () => {
		taxConfigInput.updateCountriesConfiguration!.push({
			chargeTaxes: false,
			countryCode: '' as CountryCode,
			displayGrossPrices: false,
			taxCalculationStrategy: TaxCalculationStrategy.FlatRates,
			taxAppId: null,
		});
	};

	const handleUpdateClick = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'taxConfigurationUpdate'>,
			MutationTaxConfigurationUpdateArgs
		>(TAX_CONFIG_UPDATE_MUTATION, {
			id: page.params.id!,
			input: {
				...taxConfigInput,
				updateCountriesConfiguration: taxConfigInput.updateCountriesConfiguration?.map((item) =>
					omit(item, ['existing' as keyof TaxConfigurationPerCountryInput]),
				) as TaxConfigurationPerCountryInput[],
			},
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'taxConfigurationUpdate', CommonState.EditSuccess))
			return;

		TaxConfigQuery.reexecute({
			variables: {
				id: page.params.id!,
			},
		});
	};
</script>

{#if $TaxConfigQuery.fetching}
	<SelectSkeleton label />
{:else if $TaxConfigQuery.error}
	<Alert variant="error" size="sm" bordered>{$TaxConfigQuery.error.message}</Alert>
{:else if $TaxConfigQuery.data?.taxConfiguration}
	<div class="space-y-2">
		<div class={SitenameCommonClassName}>
			<SectionHeader>Default Settings</SectionHeader>

			<div class="grid grid-cols-2 gap-2">
				<Checkbox
					label="Charge taxes"
					bind:checked={taxConfigInput.chargeTaxes}
					disabled={loading}
				/>
				<Select
					label="Method for tax calculation"
					placeholder="Select method"
					class="flex-1/2"
					options={TaxStrategies}
					bind:value={taxConfigInput.taxCalculationStrategy as string}
					disabled={loading}
				/>
			</div>

			<div class="grid grid-cols-2 gap-2 items-center">
				<Checkbox
					label="Prices entered with tax"
					bind:checked={taxConfigInput.pricesEnteredWithTax}
					disabled={loading}
				/>
				<Checkbox
					label="Display gross prices"
					bind:checked={taxConfigInput.displayGrossPrices}
					disabled={loading}
				/>
			</div>
		</div>

		<div class={SitenameCommonClassName}>
			<SectionHeader>
				<div>Country Exceptions</div>
				<Button
					size="xs"
					endIcon={Plus}
					variant="light"
					onclick={handleAddCountryClick}
					disabled={loading}
				>
					add country
				</Button>
			</SectionHeader>

			{#if !taxConfigInput.updateCountriesConfiguration!.length}
				<Alert variant="info" size="sm" bordered>No countries found</Alert>
			{:else}
				<div
					class="flex gap-2 items-center mb-2 pb-2 border-b border-gray-200 text-sm text-gray-600 font-medium"
				>
					<div class="flex-3/10">Country</div>
					<div class="flex-3/10">Charge taxes</div>
					<div class="flex-3/10">Show gross price in storefront</div>
					<div class="flex-1/10">Action</div>
				</div>

				{#each taxConfigInput.updateCountriesConfiguration! as country, idx (idx)}
					<div class="flex gap-2 items-center">
						<div class="flex-3/10">
							<Select options={Countries} bind:value={country.countryCode} disabled={loading} />
						</div>
						<div class="flex-3/10 flex items-center gap-1">
							<Checkbox bind:checked={country.chargeTaxes} disabled={loading} />
							<Select
								options={TaxStrategies}
								bind:value={country.taxCalculationStrategy as string}
								disabled={loading}
							/>
						</div>
						<div class="flex-3/10 text-center">
							<Checkbox bind:checked={country.displayGrossPrices} disabled={loading} />
						</div>
						<div class="flex-1/10">
							<IconButton
								size="xs"
								icon={Trash}
								variant="light"
								color="red"
								aria-label="Delete item"
								onclick={() => handleDeleteCountry(country)}
								disabled={loading}
							/>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<ActionBar
		onUpdateClick={handleUpdateClick}
		backButtonUrl={AppRoute.TAX_SETTINGS_CHANNELS()}
		disabled={loading}
	/>
{/if}
