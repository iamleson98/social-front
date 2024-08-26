<script lang="ts" context="module">
	const modalWidthmap: Record<SocialSize, string> = {
		xs: 'w-[48rem]',
		sm: 'w-[]',
		md: '',
		lg: '',
		xl: 'w-[48rem]'
	};
</script>

<script lang="ts">
	import type { IconType } from '$lib/components/icons';
	import type { Snippet } from 'svelte';
	import type { SocialSize } from '../common';
	import { fade } from 'svelte/transition';
	import { focusTrap } from '$lib/actions/focus-trap';

	type Props = {
		onClose: () => void;
		title: string;
		icon?: IconType;
		/** default `md` */
		width?: SocialSize;
		id?: string;
		stickyBottom?: Snippet;
	};
</script>

<section
	role="presentation"
	transition:fade={{ duration: 100 }}
	class="fixed left-0 top-0 z-[99999] flex h-dvh w-screen place-content-center place-items-center bg-black/40"
	onkeydown={(evt) => evt.stopPropagation()}
  use:focusTrap
>
  <div class="z-[99999] max-w-[95vw]">

  </div>
</section>

<style lang="postcss">
	.div {
	}
</style>
