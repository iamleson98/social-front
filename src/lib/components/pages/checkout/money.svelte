<script lang="ts">
	import type { Maybe, Money } from '$lib/gql/graphql';
	import { formatMoney } from '$lib/utils/utils';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		ariaLabel: string;
		negative?: boolean;
		class?: ClassValue;
		money?: Maybe<Omit<Money, 'fractionDigits' | 'fractionalAmount'>>;
	};

	let { ariaLabel, negative = false, class: className = '', money }: Props = $props();

	const amount = $derived.by(() => {
		if (!money) return 0;
		return negative ? -money.amount : money.amount;
	});
</script>

{#if money}
	<p class={className} aria-label={ariaLabel}>
		{formatMoney(money.currency, amount)}
	</p>
{/if}
