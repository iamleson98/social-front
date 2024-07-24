<script lang="ts">
  import ProductAttributeTab from './product-attribute-tab.svelte';
  import { type SelectedAttribute } from '$lib/gql/graphql';
  import { page } from '$app/stores';

  export let selectedAttributes: SelectedAttribute[] = [];

  enum TabType {
    DESCRIPTION = "Description",
    ATTRIBUTES = 'Attributes',
    CUSTOMER_FEEDBACK = 'Customer Feedback',
    PACKAGE = 'Package',
  }
</script>

<div>
  <div class="text-gray-600 text-lg font-bold mb-4">Product Information</div>
  
  <div role="tablist" class="tabs tabs-bordered">
  <a role="tab" class="tab" href={`${$page.url.pathname}?tab=attributes`}>
    <!-- <input type="radio" name="my_tabs_1" aria-label={TabType.ATTRIBUTES} checked="checked" /> -->
    {TabType.ATTRIBUTES}
  </a>
  <div role="tabpanel" class="tab-content p-10">
    <ProductAttributeTab selectedAttributes={selectedAttributes} />
  </div>

  <!-- <input
    type="radio"
    name="my_tabs_1"
    role="tab"
    class="tab"
    aria-label={TabType.CUSTOMER_FEEDBACK}
  /> -->
  <a role="tab" class="tab" href={`${$page.url.pathname}?tab=customer-feedback`}>
    {TabType.CUSTOMER_FEEDBACK}
  </a>
  <div role="tabpanel" class="tab-content p-10">Customer Feedback</div>

  <!-- <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label={TabType.PACKAGE} /> -->
  <a role="tab" class="tab" href={`${$page.url.pathname}?tab=packaging`}>
    {TabType.PACKAGE}
  </a>
  <div role="tabpanel" class="tab-content p-10">Tab content 3</div>
</div>
</div>

