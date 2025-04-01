<script lang="ts">
	import { Skeleton, SkeletonContainer } from "$lib/components/ui/Skeleton";
</script>

<SkeletonContainer class="bg-white rounded-lg! border border-gray-200">
  <div class="product-card-picture relative">
    <Skeleton class="w-full h-72" rounded={false} />
    <div class="absolute top-0 right-0 p-2">
      <Skeleton class="w-6 h-6" />
    </div>
  </div>

  <div class="p-6">
    <Skeleton class="w-full h-8 mb-3" />
    <Skeleton class="w-14 h-5 mb-3" />
    <Skeleton class="w-full h-7" />
  </div>
</SkeletonContainer>
