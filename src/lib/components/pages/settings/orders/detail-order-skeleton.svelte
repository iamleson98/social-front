<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { TableSkeleton } from '$lib/components/ui/Table';
</script>

<div class="flex gap-2 flex-row">
	<div class="flex gap-4 flex-col w-7/10 h-full bg-white border border-gray-200 rounded-lg p-3">
		<Skeleton class="h-8 w-38 mb-3" />
		<SelectSkeleton label size="sm" />
		<TableSkeleton numOfRows={3} numColumns={8} />
		<SelectSkeleton label size="sm" />
		<SelectSkeleton label size="sm" />
	</div>

	<div class="w-3/10">
		<div class="bg-white border border-gray-200 rounded-lg p-3">
			<Skeleton class="h-8 w-28 mb-2" />
			<SelectSkeleton label size="sm" />
		</div>
	</div>
</div>
