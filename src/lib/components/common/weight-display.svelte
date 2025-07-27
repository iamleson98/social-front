<script lang="ts">
	type Props = {
		amount: number;
		unit: string;
	};

	const { amount, unit }: Props = $props();
</script>

<div class="flex items-center justify-between gap-1">
	<span class="font-semibold text-red-600 text-right">
		{amount.toPrecision(2)}
	</span>
	<span class="text-gray-500 text-xs">{unit}</span>
</div>
