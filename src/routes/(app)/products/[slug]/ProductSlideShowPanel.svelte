<script lang="ts">
	import { ChevronLeft, ChevronRight, Icon } from '$lib/components/icons';
	import type { ProductMedia } from '$lib/gql/graphql';

	export let medias: ProductMedia[] = [];
	export let mainMedia = medias[0];
</script>

<div class="prd-display-main bg-white" style="background-image: url('{mainMedia.url}');"></div>

<div class="prd-slide bg-white">
	<div class="prd-slide-main">
		<div>
			{#each medias as media (media.id)}
				<div class="inline-block p-1 w-1/5">
					<div class="rounded relative overflow-hidden" tabindex="0" role="button">
						<div class="prd-thumbnail" style="background-image: url('{media.url}');"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<button class="left-2 slide-btn" tabindex="0">
		<Icon icon={ChevronLeft} />
	</button>

	<button class="right-2 slide-btn" tabindex="0">
		<Icon icon={ChevronRight} />
	</button>
</div>

<style lang="postcss">
	.prd-display-main {
		@apply rounded w-full bg-no-repeat bg-cover bg-center;
		padding-top: 100% !important;
	}

	.prd-thumbnail {
		@apply rounded bg-contain bg-no-repeat bg-center;
		padding-top: 100% !important;
	}

	.prd-slide {
		@apply relative w-full;
	}
	.slide-btn {
		@apply rounded-full w-7 h-7 absolute top-1/2 -translate-y-1/2 bg-gray-50 transform hover:bg-gray-100 flex items-center justify-center;
	}
</style>
