<script lang="ts">
	import { SelectSkeleton } from "$lib/components/ui/select";
	import { Skeleton } from "$lib/components/ui/Skeleton";
	import { SitenameCommonClassName } from "$lib/utils/utils";

</script>
<div class="flex gap-2">
	<div class="w-7/10 {SitenameCommonClassName}">
		<Skeleton class="w-1/5 h-4" />
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>

	<div class="w-3/10 {SitenameCommonClassName}">
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>
</div>
