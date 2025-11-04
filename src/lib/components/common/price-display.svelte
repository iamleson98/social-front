<script lang="ts">
	import { formatCurrency } from '$lib/utils/utils';

	type Props = {
		amount: number | undefined;
		currency: string;
		class?: string;
		negate?: boolean;
	};

	const { amount, currency, class: className = '', negate }: Props = $props();

	const inferAmount = () => {
		if (amount == undefined) return 0;
		return negate ? -amount : amount;
	};
</script>

<div class="flex items-center gap-1 {className}">
	<span class="text-gray-500 text-xs">{currency}</span>
	<span class="font-semibold text-blue-600 text-right">
		{formatCurrency(inferAmount())}
	</span>
</div>
