<script>
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
</script>

<div class="flex flex-row gap-2">
	<div class="p-3 rounded-lg bg-white border border-gray-200 space-y-3 w-6/10">
    <Skeleton class="w-1/2 h-4" />
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>

	<div class="p-3 rounded-lg bg-white border border-gray-200 space-y-3 w-4/10"></div>
</div>
