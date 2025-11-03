<script lang="ts">
    import { fly } from 'svelte/transition';

    let count = $state(0);
</script>

<button onclick={() => count++}>+1</button>
<button onclick={() => count--}>-1</button>

<div>
    {#key count}
        <span in:fly out:fly>{count}</span>
    {/key}
</div>
