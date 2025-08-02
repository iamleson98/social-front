<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class="flex gap-2 flex-row">
	<div class="w-6/10 space-y-2">
		<div class={SitenameCommonClassName}>
			<Skeleton class="ư-1/4 h-5" />
			<SelectSkeleton label />
		</div>

		<TableSkeleton numOfRows={5} numColumns={4} />
	</div>
	<div class="w-4/10 {SitenameCommonClassName}">
		<Skeleton class="ư-1/4 h-5" />
		<TableSkeleton numOfRows={10} numColumns={2} />
	</div>
</div>
