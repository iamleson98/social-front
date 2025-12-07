<script lang="ts">
	import SectionHeader from "$lib/components/common/section-header.svelte";
	import { OrderAction, type Order } from "$lib/gql/graphql";

  type Props = {
    useLegacyPaymentsApi: boolean;
    onMarkAsPaid: () => any;
    order: Order;
  };

  let { useLegacyPaymentsApi, onMarkAsPaid, order }: Props = $props();

  
</script>

<div class="space-y-2">
  <SectionHeader>Order Summary</SectionHeader>

  {#if useLegacyPaymentsApi}
  {#if order.actions.includes(OrderAction.Capture)}
    
  {/if}
  {:else}
    <div></div>
  {/if}
</div>
