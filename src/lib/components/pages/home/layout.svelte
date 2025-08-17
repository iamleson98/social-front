<script lang="ts">
	import Sidebar from './sidebar.svelte';
	import ProductListSection from './product-list-section.svelte';
	import RecommendationSection from './recommendation-section.svelte';
</script>

<div class="flex gap-6">
	<aside
		class="sticky overflow-auto top-16 h-fit w-1/5 tablet:hidden!"
		style="scrollbar-width: none;"
	>
		<Sidebar />
	</aside>

	<div class="w-4/5 flex gap-3">
		<div class="w-3/4 tablet:w-full">
			<ProductListSection />
		</div>
		<div
			class="w-1/4 tablet:hidden sticky overflow-auto top-16 h-[calc(100vh-4rem)]"
			style="scrollbar-width: none;"
		>
			<RecommendationSection />
		</div>
	</div>
</div>
