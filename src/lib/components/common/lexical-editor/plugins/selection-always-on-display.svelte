<script lang="ts">
	import { selectionAlwaysOnDisplay } from '@lexical/utils';
	import type { LexicalEditor } from 'lexical';

	type Props = {
		editor: LexicalEditor;
	};

	let { editor }: Props = $props();

	$effect(() => {
		return selectionAlwaysOnDisplay(editor);
	});
</script>

<div class="hidden!"></div>
