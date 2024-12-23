<script lang="ts">
	import { contentData, selectedId } from '../../../../routes/document/data_content';
	import { derived } from 'svelte/store';

	const content = derived(selectedId, ($selectedId) => contentData[$selectedId]);
	interface Props {
		idDoc: String;
	}

	let { idDoc }: Props = $props();
</script>

<div class="content">
	{@html $content}
	<p class="text-white">{idDoc}</p>
</div>
