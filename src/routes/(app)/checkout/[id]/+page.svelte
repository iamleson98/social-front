<script lang="ts">
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();
</script>

<div>
	<div>Checkout</div>

	<CheckoutLayout checkout={data.checkout} />
</div>
