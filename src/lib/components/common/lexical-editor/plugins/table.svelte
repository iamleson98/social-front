<script lang="ts">
	import { type LexicalEditor } from 'lexical';
	import {
		registerTableCellUnmergeTransform,
		registerTablePlugin,
		registerTableSelectionObserver,
		setScrollableTablesActive,
		TableCellNode
	} from '@lexical/table';

	type Props = {
		editor: LexicalEditor;
		/**
		 * When `false` (default `true`), merged cell support (colspan and rowspan) will be disabled and all
		 * tables will be forced into a regular grid with 1x1 table cells.
		 */
		hasCellMerge?: boolean;
		/**
		 * When `false` (default `true`), the background color of TableCellNode will always be removed.
		 */
		hasCellBackgroundColor?: boolean;
		/**
		 * When `true` (default `true`), the tab key can be used to navigate table cells.
		 */
		hasTabHandler?: boolean;
		/**
		 * When `true` (default `false`), tables will be wrapped in a `<div>` to enable horizontal scrolling
		 */
		hasHorizontalScroll?: boolean;
	};

	let {
		editor,
		hasCellMerge = true,
		hasCellBackgroundColor = true,
		hasTabHandler = true,
		hasHorizontalScroll = false
	}: Props = $props();

	$effect(() => {
		setScrollableTablesActive(editor, hasHorizontalScroll);
		const unregiter1 = registerTablePlugin(editor);
		const unregister2 = registerTableSelectionObserver(editor, hasTabHandler);

		return () => {
			unregiter1();
			unregister2();
		};
	});

	$effect(() => {
		if (!hasCellMerge) {
			return registerTableCellUnmergeTransform(editor);
		}
	});

	$effect(() => {
		if (!hasCellBackgroundColor) {
			return editor.registerNodeTransform(TableCellNode, (node) => {
				if (node.getBackgroundColor() !== null) {
					node.setBackgroundColor(null);
				}
			});
		}
	});
</script>
