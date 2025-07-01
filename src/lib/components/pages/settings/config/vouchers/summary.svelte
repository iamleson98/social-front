<script lang="ts">
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import type { Voucher } from '$lib/gql/graphql';

	type Props = {
		voucher: Voucher;
	};

	let { voucher }: Props = $props();
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Summary</SectionHeader>

	<div class="text-sm">
		<div class="font-medium">Applies to</div>
		<div>{voucher.type.toLocaleLowerCase().split('_').join(' ')}</div>
	</div>

	<div class="text-sm">
		<div class="font-medium">Value</div>
		<div>
			<PriceDisplay amount={25} currency="USD" />
		</div>
	</div>
</div>
