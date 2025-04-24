<script lang="ts">
	import { page } from '$app/state';
	import { Icon, Trash, type IconContent } from '$lib/components/icons';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { IconButton } from '$lib/components/ui/Button';
	import type { Channel } from '$lib/gql/graphql';

  type Props = {
    channel: Channel;
  };

  type TabItem = {
    name: string;
  };

  let { channel }: Props = $props();
</script>

<div class="rounded-lg bg-white border border-gray-200 mt-3 p-2">
  {#snippet sidebarItem(item: TabItem)}
    <div class="flex items-center justify-between gap-1 rounded-md py-1">
      <span class="truncate">{item.name}</span>
      <IconButton icon={Trash} size="xs"/>
    </div>
  {/snippet}

  <AccordionList
    header="Shipping zones"
    child={sidebarItem}
    items={[]}
    class="w-full"
    open={false}
  />

  <AccordionList
    header="2 Warehouses"
    child={sidebarItem}
    items={[]}
    class="w-full"
    open={false}
  />
</div>