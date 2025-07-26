<script lang="ts">
	import { RadioSkeleton } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class={SitenameCommonClassName}>
	<Skeleton class="w-1/3 h-5" />
	<SelectSkeleton label />
  <RadioSkeleton />
</div>

<TableSkeleton numOfRows={3} numColumns={3} class="mt-2" />
