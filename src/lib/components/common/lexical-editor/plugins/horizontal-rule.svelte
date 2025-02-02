<script lang="ts">
	import {
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		COMMAND_PRIORITY_EDITOR,
		COMMAND_PRIORITY_LOW,
		type LexicalEditor
	} from 'lexical';
	import { INSERT_HORIZONTAL_RULE_COMMAND } from './consts';

	type Props = {
		editor: LexicalEditor;
	};

	let { editor }: Props = $props();

	$effect(() => {
		return editor.registerCommand(
			INSERT_HORIZONTAL_RULE_COMMAND,
			(type) => {
				const selection = getSelection();

				if (!isRangeSelection(selection)) return false;

				const focusNode = selection.focus.getNode();

				if (focusNode !== null) {
					// const horizontalRuleNode = $createHorizontalRuleNode();
					// $insertNodeToNearestRoot(horizontalRuleNode);
				}

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		);
	});
</script>
