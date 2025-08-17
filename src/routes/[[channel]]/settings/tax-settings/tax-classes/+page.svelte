<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { TAX_CLASS_DELETE_MUTATION, TAX_CLASS_UPDATE_MUTATION } from '$lib/api/admin/tax';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { ChevronRight, Icon, Plus } from '$lib/components/icons';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import { Button } from '$lib/components/ui';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { type TabItem } from '$lib/components/ui/Tab';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type {
		CountryCode,
		CountryRateUpdateInput,
		MetadataItem,
		Mutation,
		MutationTaxClassDeleteArgs,
		MutationTaxClassUpdateArgs,
		Query,
		QueryTaxClassesArgs,
		TaxClassUpdateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	const TaxClassesQuery = operationStore<Pick<Query, 'taxClasses'>, QueryTaxClassesArgs>({
		query: TAX_CLASSES_QUERY,
		variables: {
			first: 100,
		},
    requestPolicy: 'cache-and-network',
	});
	const ClassId = $derived(page.url.searchParams.get('id'));

	let activeTaxClass = $state<TaxClassUpdateInput>();
	let activeMetadata = $state<MetadataItem[]>();
	let activePrivateMetadata = $state<MetadataItem[]>();
	let loading = $state(false);
	let metadataRef = $state<any>();

	afterNavigate(() => {
		if (ClassId) {
			const taxClass = $TaxClassesQuery.data?.taxClasses?.edges?.find(
				(edge) => edge.node.id === ClassId,
			);
			if (taxClass) {
				activeTaxClass = {
					name: taxClass.node.name,
					updateCountryRates: taxClass.node.countries.map<CountryRateUpdateInput>((country) => ({
						countryCode: country.country.code as CountryCode,
						rate: country.rate,
					})),
					removeCountryRates: [],
				};

				activeMetadata = taxClass.node.metadata;
				activePrivateMetadata = taxClass.node.privateMetadata;
			}
		}
	});

	onMount(() =>
		TaxClassesQuery.subscribe((result) => {
			if (result.data?.taxClasses?.edges.length) {
				goto(AppRoute.TAX_SETTINGS_TAX_CLASS_DETAILS(result.data.taxClasses.edges[0].node.id));
			}
		}),
	);

	const handleUpdateTaxClass = async () => {
		if (!ClassId || !activeTaxClass) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'taxClassUpdate'>,
			MutationTaxClassUpdateArgs
		>(TAX_CLASS_UPDATE_MUTATION, {
			id: ClassId,
			input: activeTaxClass,
		});

		const hasErr = await metadataRef.handleUpdate();
		if (hasErr) {
			loading = false;
			return;
		}

		if (checkIfGraphqlResultHasError(result, 'taxClassUpdate', CommonState.EditSuccess)) {
			loading = false;
			return;
		}

		loading = false;
		// await goto(AppRoute.TAX_SETTINGS_TAX_CLASSES());
		TaxClassesQuery.reexecute({ variables: { first: 100 } });
	};

	const handleDeleteTaxClass = async () => {
		if (!ClassId) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'taxClassDelete'>,
			MutationTaxClassDeleteArgs
		>(TAX_CLASS_DELETE_MUTATION, {
			id: ClassId,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'taxClassDelete', CommonState.DeleteSuccess)) {
			return;
		}

		TaxClassesQuery.reexecute({ variables: { first: 100 } });
		await goto(AppRoute.TAX_SETTINGS_TAX_CLASSES());
	};
</script>

{#if $TaxClassesQuery.fetching}
	<div class="flex gap-2">
		<div class="w-3/10">
			<TableSkeleton numColumns={1} numOfRows={4} />
		</div>
		<div class="w-7/10">
			<TableSkeleton numColumns={2} numOfRows={3} />
		</div>
	</div>
{:else if $TaxClassesQuery.error}
	<Alert variant="error" size="sm" bordered>{$TaxClassesQuery.error.message}</Alert>
{:else if $TaxClassesQuery.data?.taxClasses?.edges}
	{@const items: TabItem[] = $TaxClassesQuery.data.taxClasses.edges.map<TabItem>((edge) => ({
  title: edge.node.name,
  active: (page.url.searchParams.get('id') ===edge.node.id),
  href: AppRoute.TAX_SETTINGS_TAX_CLASS_DETAILS(edge.node.id),
}))}
	<div class="flex gap-2">
		<div class="w-3/10 space-y-2">
			<AccordionList header="Tax classes" {items} class={SitenameCommonClassName}>
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
								<span transition:fly={{ x: -10 }}>
									<Icon icon={ChevronRight} size="sm" />
								</span>
							{/if}
						</div>
					</a>
				{/snippet}
			</AccordionList>

			<Button size="sm" fullWidth endIcon={Plus} disabled={loading}>Add class</Button>
		</div>

		<div class="w-7/10 space-y-2">
			{#if activeTaxClass && ClassId}
				<div class={SitenameCommonClassName}>
					<SectionHeader>General information</SectionHeader>
					<Input
						placeholder="Enter name"
						bind:value={activeTaxClass.name}
						label="Name"
						disabled={loading}
					/>

					<SectionHeader>Tax class rates</SectionHeader>
					<div
						class="grid grid-cols-2 gap-2 items-center text-sm font-semibold text-gray-600 pb-2 mb-2 border-b border-gray-200"
					>
						<span>Country</span>
						<span>Tax Rate</span>
					</div>
					{#each activeTaxClass.updateCountryRates || [] as rate, idx (idx)}
						<div class="grid grid-cols-2 gap-2 items-center text-sm font-semibold text-gray-600">
							<span>{rate.countryCode}</span>
							<Input
								type="number"
								placeholder="Enter rate"
								bind:value={rate.rate}
								disabled={loading}
                min={0}
                max={100}
							>
								{#snippet action()}
									<span class="text-gray-500 font-bold text-xs">%</span>
								{/snippet}
							</Input>
						</div>
					{/each}
				</div>

				<GeneralMetadataEditor
					metadata={activeMetadata}
					objectId={ClassId}
					privateMetadata={activePrivateMetadata}
					bind:this={metadataRef}
          disabled={loading}
				/>

				<ActionBar
					backButtonUrl={AppRoute.TAX_SETTINGS_TAX_CLASSES()}
					disabled={loading}
					onUpdateClick={handleUpdateTaxClass}
					onDeleteClick={handleDeleteTaxClass}
				/>
			{/if}
		</div>
	</div>
{/if}
