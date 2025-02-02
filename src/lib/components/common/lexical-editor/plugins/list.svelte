<script lang="ts">
	import {
		$handleListInsertParagraph as handleListInsertParagraph,
		INSERT_ORDERED_LIST_COMMAND,
		INSERT_UNORDERED_LIST_COMMAND,
		insertList,
		ListItemNode,
		ListNode,
		REMOVE_LIST_COMMAND,
		removeList
	} from '@lexical/list';
	import { mergeRegister } from '@lexical/utils';
	import { COMMAND_PRIORITY_LOW, INSERT_PARAGRAPH_COMMAND, type LexicalEditor } from 'lexical';

	type Props = {
		editor: LexicalEditor;
	};

	let { editor }: Props = $props();

	if (!editor.hasNodes([ListNode, ListItemNode])) {
		throw new Error('ListPlugin: ListNode and/or ListItemNode not registered on editor');
	}

	$effect(() => {
		return mergeRegister(
			editor.registerCommand(
				INSERT_ORDERED_LIST_COMMAND,
				() => {
					insertList(editor, 'number');
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				INSERT_UNORDERED_LIST_COMMAND,
				() => {
					insertList(editor, 'bullet');
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				REMOVE_LIST_COMMAND,
				() => {
					removeList(editor);
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				INSERT_PARAGRAPH_COMMAND,
				() => {
					return handleListInsertParagraph();
				},
				COMMAND_PRIORITY_LOW
			)
		);
	});
</script>
