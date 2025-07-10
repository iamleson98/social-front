<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<Skeleton class="w-1/4 h-3" />

	<div class="flex gap-2 items-start">
		<SelectSkeleton label size="md" />
		<SelectSkeleton label size="md" />
	</div>

	<SelectSkeleton label size="md" />

	<div class="flex gap-2 items-start">
		<SelectSkeleton label size="md" />
		<SelectSkeleton label size="md" />
	</div>
</div>
