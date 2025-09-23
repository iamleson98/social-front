<script lang="ts">
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class={SitenameCommonClassName}>
	<SelectSkeleton label />
	<SelectSkeleton label />
	<TableSkeleton numOfRows={5} numColumns={4} />
</div>
