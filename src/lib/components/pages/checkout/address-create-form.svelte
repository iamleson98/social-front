<script lang="ts">
	import type { CountryCode } from '$lib/gql/graphql';

	type Props = {
		availableCountries: CountryCode[];
		title: string;
	};

	let { title, availableCountries }: Props = $props();
</script>

<div></div>
