<script lang="ts">
	import { Select } from '$lib/components/ui/select';
	import type { CountryCode, Query, QueryAddressValidationRulesArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api';
	import { ADDRESS_VALIDATION_RULES_QUERY } from '$lib/stores/api/account';
	import { getCountryName } from '$lib/utils/address';

	type Props = {
		availableCountries: CountryCode[];
	};

	let { availableCountries }: Props = $props();

	const validationStore = operationStore<
		Pick<Query, 'addressValidationRules'>,
		QueryAddressValidationRulesArgs
	>({
		kind: 'query',
		query: ADDRESS_VALIDATION_RULES_QUERY,
		variables: {
			// countryCode
		},
		context: { requestPolicy: 'cache-and-network' },
		pause: true
	});

	// validationStore.
</script>

<div>
	<Select
		options={availableCountries.map((code) => ({ value: code, label: getCountryName(code) }))}
	/>
</div>
