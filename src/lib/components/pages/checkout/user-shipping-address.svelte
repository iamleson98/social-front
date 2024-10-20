<script lang="ts">
	import type { Checkout } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

  // operationStore<Pick>
</script>
