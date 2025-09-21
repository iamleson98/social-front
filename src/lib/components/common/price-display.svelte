<script lang="ts">
	import { formatCurrency } from '$lib/utils/utils';

	type Props = {
		amount: number;
		currency: string;
		class?: string;
	};

	const { amount, currency, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-1 {className}">
	<span class="text-gray-500 text-xs">{currency}</span>
	<span class="font-semibold text-blue-600 text-right">
		{formatCurrency(amount)}
	</span>
</div>
