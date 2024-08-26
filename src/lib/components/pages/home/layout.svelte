<script lang="ts">
	import Sidebar from './sidebar.svelte';
	import ProductListSection from './product-list-section.svelte';
	import RecommendationSection from './recommendation-section.svelte';
</script>

<div class="flex gap-6">
	<aside class="sticky overflow-auto top-16 h-dvh w-1/5" style="scrollbar-width: none;">
		<Sidebar />
	</aside>

	<div class="w-4/5 flex gap-3">
		<div class="w-2/3 tablet:w-full">
			<ProductListSection />
		</div>
		<div
			class="w-1/3 tablet:hidden sticky overflow-auto top-16 h-dvh"
			style="scrollbar-width: none;"
		>
			<RecommendationSection />
		</div>
	</div>
</div>
