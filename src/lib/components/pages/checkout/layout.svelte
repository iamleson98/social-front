<script lang="ts">
	import CheckoutSummary from './checkout-summary.svelte';
	import CheckoutForm from './checkout-form.svelte';
</script>

<div class="flex flex-row gap-2 flex-nowrap tablet:flex-wrap tablet:flex-row-reverse">
	<CheckoutForm />
	<CheckoutSummary />
</div>

<div class="fixed z-50 bottom-0 left-0 right-0 bg-white h-14">

</div>
