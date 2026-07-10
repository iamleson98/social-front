<script lang="ts">
	import ProductListSection from './product-list-section.svelte';
	import RecommendationSection from './recommendation-section.svelte';
	import Sidebar from './sidebar.svelte';
</script>

<div class="flex gap-6">
	<aside
		class="sticky overflow-y-auto top-16 h-[calc(100vh-4rem)] w-1/5 max-tablet:hidden!"
		style="scrollbar-width: none;"
	>
		<Sidebar />
	</aside>

	<div class="w-4/5 flex gap-3">
		<div class="w-3/4 max-tablet:w-full">
			<ProductListSection />
		</div>
		<div
			class="w-1/4 max-tablet:hidden sticky top-16 h-[calc(100vh-4rem)]"
			style="scrollbar-width: none;"
		>
			<RecommendationSection />
		</div>
	</div>
</div>
