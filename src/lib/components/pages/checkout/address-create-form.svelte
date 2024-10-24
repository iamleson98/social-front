<script lang="ts">
	import type { CountryCode } from '$lib/gql/graphql';
	import AddressForm from './address-form.svelte';

	type Props = {
		availableCountries: CountryCode[];
		onHide: () => void;
	};

	let { availableCountries, onHide }: Props = $props();
</script>

<div>
	<p>Create address</p>

	<AddressForm {availableCountries} />
</div>
