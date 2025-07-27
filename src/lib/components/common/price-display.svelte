<script lang="ts">
	import { formatCurrency } from '$lib/utils/utils';

	type Props = {
		amount: number;
		currency: string;
	};

	const { amount, currency }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<span class="text-gray-500 text-xs">{currency}</span>
	<span class="font-semibold text-blue-600 text-right">
		{formatCurrency(amount)}
	</span>
</div>
