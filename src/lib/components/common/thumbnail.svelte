<script lang="ts">
	import type { SocialRadius, SocialSize } from '../ui/common';

	type Props = {
		src?: string;
		alt: string;
		size?: SocialSize;
		radius?: SocialRadius;
	};

	let { src, alt, size = 'md', radius = 'rounded-md' }: Props = $props();

	const sizes: Record<SocialSize, string> = {
		xs: 'w-8 h-8',
		sm: 'w-10 h-10',
		md: 'w-12 h-12',
		lg: 'w-16 h-16',
		xl: 'w-20 h-20',
	};
</script>

<div class="avatar">
	<div
		class="{sizes[
			size
		]} {radius} border border-gray-200 flex! items-center justify-center text-white font-bold"
		class:bg-blue-500={!src}
	>
		{#if src}
			<img {src} {alt} />
		{:else}
			<span>{alt.slice(0, 2)}</span>
		{/if}
	</div>
</div>
