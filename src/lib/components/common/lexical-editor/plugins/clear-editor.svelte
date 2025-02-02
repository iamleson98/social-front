<script lang="ts">
	import {
		$createParagraphNode as createParagraphNode,
		$getRoot as getRoot,
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		CLEAR_EDITOR_COMMAND,
		COMMAND_PRIORITY_EDITOR,
		type LexicalEditor
	} from 'lexical';
	type Props = {
		editor: LexicalEditor;
		onClear?: () => void;
	};

	let { editor, onClear }: Props = $props();

	$effect(() => {
		editor.registerCommand(
			CLEAR_EDITOR_COMMAND,
			(payload) => {
				editor.update(() => {
					if (onClear) {
						onClear();
						return;
					}

					const root = getRoot();
					const selection = getSelection();
					const paragraph = createParagraphNode();
					root.clear();
					root.append(paragraph);

					if (selection) paragraph.select();
					if (isRangeSelection(selection)) selection.format = 0;
				});

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		);
	});
</script>

<div class="hidden!"></div>
