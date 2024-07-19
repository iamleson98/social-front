<script lang="ts">
	import type { SelectItem } from './types';

	export let values: SelectItem<string>[] = [];
  export let multiple: boolean = false;
  export let maxHeight: string | number = 500;
</script>

<div>
  <div>

  </div>
  {#each values as { value, label }, idx (idx)}
    <div>{label}</div>
  {/each}
</div>
