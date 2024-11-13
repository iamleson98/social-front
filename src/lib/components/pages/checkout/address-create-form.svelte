<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { type SelectOption } from '$lib/components/ui/select';
	import type { CountryCode } from '$lib/gql/graphql';
	import { getCountryName } from '$lib/utils/address';
	import AddressForm from './address-form.svelte';

	type Props = {
		availableCountries: CountryCode[];
		onCancel: () => void;
	};

	let { availableCountries, onCancel }: Props = $props();

	const countrySelectOptions = $derived(
		availableCountries.map<SelectOption>((code) => ({
			value: code,
			label: getCountryName(code)
		}))
	);
</script>

<div>
	<AddressForm {countrySelectOptions} onSubmit={console.log} onCancel={onCancel} />
	<Button size="xs" color="red" variant="light" class="mt-2" onclick={onCancel}>cancel</Button>
</div>
