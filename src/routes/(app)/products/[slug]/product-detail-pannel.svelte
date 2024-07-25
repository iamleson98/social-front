<script lang="ts">
  import { type SelectedAttribute } from '$lib/gql/graphql';
  import { page, navigating } from '$app/stores';
  // import { type SvelteComponent, onMount } from "svelte";
  // import ProductDescriptionTab from './product-description-tab.svelte';
  // import ProductAttributeTab from './product-attribute-tab.svelte';
  // import ProductCustomerFeedbackTab from './product-customer-feedback-tab.svelte';
  // import ProductPackagingTab from './product-packaging-tab.svelte';
  import { Icon, HeadSet, SettingCheck, FileText, PackageExport } from '$lib/components/icons';

  export let selectedAttributes: SelectedAttribute[] = [];

  let pathname = $page.url.pathname;
  // let search = $page.url.search;

  type TabType = {
    name: 'Description' | 'Attributes' | 'Customer Feedback' | 'Packaging';
    icon: typeof FileText;
    path: string;
  };

  const tabs: TabType[] = [
    {
      name: 'Description',
      path: pathname,
      icon: FileText,
    },
    {
      name: 'Attributes',
      path: `${pathname}?tab=attributes`,
      icon: SettingCheck,
    },
    {
      name: 'Customer Feedback',
      path: `${pathname}?tab=customer-feedback`,
      icon: HeadSet,
    },
    {
      name: 'Packaging',
      path: `${pathname}?tab=packaging`,
      icon: PackageExport,
    },
  ];
</script>

<div>
  <div class="text-gray-600 text-lg font-semibold mb-4">Product Information</div>

    {#if $navigating}
      <p>Loading...</p>
    {/if}

  <div class="flex items-center gap-2">
    {#each tabs as tab (tab.name)}
      <a
        role="tab"
        class="inline"
        href={tab.path}
      >
        <button 
          class="btn btn-sm no-animation"
          class:tab-active={tab.path === pathname + search}
        >
          <Icon icon={tab.icon} />
          <span>{tab.name}</span>
        </button>
      </a>
    {/each}
  </div>
</div>

<style lang="postcss">
  .tab-active {
    @apply bg-blue-100 text-blue-500;
    outline: none !important;
  }
</style>
