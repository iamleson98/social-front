<script lang="ts">
	import { SelectSkeleton } from "$lib/components/ui/select";
	import { Skeleton } from "$lib/components/ui/Skeleton";

</script>
<div class="flex gap-2">
	<div class="w-7/10 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
		<Skeleton class="w-1/5 h-4" />
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>

	<div class="w-3/10 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>
</div>
