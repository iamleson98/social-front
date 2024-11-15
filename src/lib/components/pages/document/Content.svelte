<script lang="ts">
	import { contentData, selectedId } from '../../../../routes/document/data_content';
	import { derived } from 'svelte/store';

	const content = derived(selectedId, ($selectedId) => contentData[$selectedId]);
</script>

<div class="content">
	{@html $content}
</div>
