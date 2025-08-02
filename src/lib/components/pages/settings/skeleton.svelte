<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class="flex gap-2 flex-row">
	<div class="w-1/4 {SitenameCommonClassName}">
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>
	<div class="w-3/4 {SitenameCommonClassName}">
		<SelectSkeleton label />
		<TableSkeleton numOfRows={5} numColumns={5} />
	</div>
</div>
