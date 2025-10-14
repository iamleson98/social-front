<script lang="ts">
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class="flex gap-2">
	<div class="{SitenameCommonClassName} w-7/10">
		<Skeleton class="w-1/4 h-4" />
		<SelectSkeleton label />
		<TableSkeleton numColumns={4} numOfRows={4} showPagination />
	</div>

	<div class="{SitenameCommonClassName} w-3/10">
		<Skeleton class="w-1/4 h-4" />
		<SelectSkeleton label />
	</div>
</div>
