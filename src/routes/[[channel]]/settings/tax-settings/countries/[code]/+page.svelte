<script lang="ts">
	import { GET_TAX_COUNTRY_CONFIGURATION_DETAIL_QUERY } from '$lib/api/admin/tax';
	import { operationStore } from '$lib/api/operation';
	import type { Query, QueryTaxCountryConfigurationArgs } from '$lib/gql/graphql';
	import { page } from '$app/state';

	const ConfigQuery = operationStore<
		Pick<Query, 'taxCountryConfiguration'>,
		QueryTaxCountryConfigurationArgs
	>({
		kind: 'query',
		query: GET_TAX_COUNTRY_CONFIGURATION_DETAIL_QUERY,
		variables: {
			countryCode: page.params.code,
		},
	});

	$inspect($ConfigQuery.data?.taxCountryConfiguration);
</script>
