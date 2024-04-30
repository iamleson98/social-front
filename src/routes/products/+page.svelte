<script lang="ts">
  import type { PageData } from './$houdini'

  export let data: PageData;

  $: ({ Products } = data);
</script>

<div>
  {#each $Products.data?.products?.edges ?? [] as {node}, i}
    <div>
      <h2>{node.id}</h2>
      <p>{node.name}</p>
    </div>
  {/each}
</div>
