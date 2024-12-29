<script lang="ts">
	// import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
</script>

{#snippet cartLineSkeleton()}
	<div class="bg-white rounded-lg p-4 w-full border mb-2">
		<div class="flex gap-2">
			<div class="w-1/12">
				<Skeleton class="w-16 h-16" rounded={false} />
			</div>

			<div class="w-1/2">
				<Skeleton class="w-full h-4 mb-2" />
				<Skeleton class="w-1/2 h-2" />
			</div>

			<div class="w-1/3">
				<Skeleton class="h-4" />
			</div>
		</div>
	</div>
{/snippet}

<div class="flex flex-row justify-between tablet:flex-wrap tablet:flex-col gap-2">
	<div class="w-3/4 tablet:h-full">
    {@render cartLineSkeleton()}
    {@render cartLineSkeleton()}
  </div>

  <div class="w-1/4 tablet:w-full"></div>
</div>
