<script lang="ts">
	import { createEmptyHistoryState, registerHistory, type HistoryState } from '@lexical/history';
	import type { LexicalEditor } from 'lexical';

	type Props = {
		editor: LexicalEditor;
		externalHistoryState?: HistoryState;
		delay?: number;
	};

	let { editor, externalHistoryState, delay = 1000 }: Props = $props();

	let historyState = $derived(externalHistoryState || createEmptyHistoryState());

	$effect(() => {
		return registerHistory(editor, historyState, delay);
	});
</script>

<div class="hidden!"></div>
