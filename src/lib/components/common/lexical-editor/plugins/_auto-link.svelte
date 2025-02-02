<script lang="ts">
	import {
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		COMMAND_PRIORITY_LOW,
		TextNode,
		type LexicalEditor
	} from 'lexical';
	import {
		$isAutoLinkNode as isAutoLinkNode,
		$isLinkNode as isLinkNode,
		AutoLinkNode,
		TOGGLE_LINK_COMMAND
	} from '@lexical/link';
	import { mergeRegister } from '@lexical/utils';
	import {
		$handleLinkCreation as handleLinkCreation,
		getTextNodesToMatch,
		handleBadNeighbors,
		handleLinkEdit,
		startsWithSeparator,
		type ChangeHandler,
		type LinkMatcher
	} from './consts';

	type Props = {
		editor: LexicalEditor;
		onChange?: ChangeHandler;
		matchers: Array<LinkMatcher>;
	};

	let { editor, onChange, matchers }: Props = $props();

	$effect(() => {
		if (!editor.hasNodes([AutoLinkNode])) {
			throw new Error('LexicalAutoLinkPlugin: AutoLinkNode not registered on editor');
		}

		const onChangeWrapped = (url: string | null, prevUrl: string | null) => {
			if (onChange) {
				onChange(url, prevUrl);
			}
		};

		return mergeRegister(
			editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
				const parent = textNode.getParentOrThrow();
				const previous = textNode.getPreviousSibling();
				if (isAutoLinkNode(parent) && !parent.getIsUnlinked()) {
					handleLinkEdit(parent, matchers, onChangeWrapped);
				} else if (!isLinkNode(parent)) {
					if (
						textNode.isSimpleText() &&
						(startsWithSeparator(textNode.getTextContent()) || !isAutoLinkNode(previous))
					) {
						const textNodesToMatch = getTextNodesToMatch(textNode);
						handleLinkCreation(textNodesToMatch, matchers, onChangeWrapped);
					}

					handleBadNeighbors(textNode, matchers, onChangeWrapped);
				}
			}),
			editor.registerCommand(
				TOGGLE_LINK_COMMAND,
				(payload) => {
					const selection = getSelection();
					if (payload !== null || !isRangeSelection(selection)) {
						return false;
					}
					const nodes = selection.extract();
					nodes.forEach((node) => {
						const parent = node.getParent();

						if (isAutoLinkNode(parent)) {
							// invert the value
							parent.setIsUnlinked(!parent.getIsUnlinked());
							parent.markDirty();
							return true;
						}
					});
					return false;
				},
				COMMAND_PRIORITY_LOW
			)
		);
	});
</script>

<div class="hidden!"></div>
