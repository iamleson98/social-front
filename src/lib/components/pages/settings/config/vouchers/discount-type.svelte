<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { RadioButton } from '$lib/components/ui/Input';
	import { VoucherTypeEnum } from '$lib/gql/graphql';

	type Props = {
		discountType: VoucherTypeEnum;
	};

	let { discountType = $bindable() }: Props = $props();

	const VOUCHER_TYPES: VoucherTypeEnum[] = [
		VoucherTypeEnum.EntireOrder,
		VoucherTypeEnum.Shipping,
		VoucherTypeEnum.SpecificProduct,
	];
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Discount type</SectionHeader>

	<div class="space-y-2">
		{#each VOUCHER_TYPES as type, idx (idx)}
			<RadioButton size="sm" label={type.toLocaleLowerCase().split('_').join(' ')} bind:group={discountType} value={type} />
		{/each}
	</div>
</div>
