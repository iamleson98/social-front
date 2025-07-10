<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { TableSkeleton } from '$lib/components/ui/Table';
</script>

<div class="flex gap-2">
	<div class="bg-white rounded-lg p-3 border border-gray-200 w-7/10 space-y-2">
		<Skeleton class="w-1/4 h-4" />
		<SelectSkeleton label />
		<TableSkeleton numColumns={4} numOfRows={4} showPagination />
	</div>

	<div class="bg-white rounded-lg p-3 border border-gray-200 w-3/10">
		<Skeleton class="w-1/4 h-4" />
		<SelectSkeleton label />
	</div>
</div>
