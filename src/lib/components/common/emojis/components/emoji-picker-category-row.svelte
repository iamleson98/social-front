<script lang="ts">
	import type { EmojiCategory } from '../types';

	type Props = {
		categoryName: EmojiCategory;
		class?: string;
	};

	let { categoryName, class: className = '' }: Props = $props();
</script>

<div class={[className, 'flex items-center h-full pe-1 ps-3']} role="row">
	<div
		id={`emojipickercat-${categoryName}`}
		class="relative content-center text-xs font-bold text-gray-500 leading-normal uppercase"
	>
		{categoryName}
	</div>
</div>
