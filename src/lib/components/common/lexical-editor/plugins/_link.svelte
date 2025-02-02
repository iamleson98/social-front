<script lang="ts">
	import {
		LinkNode,
		TOGGLE_LINK_COMMAND,
		$toggleLink as toggleLink,
		type LinkAttributes
	} from '@lexical/link';
	import { mergeRegister, objectKlassEquals } from '@lexical/utils';
	import {
		COMMAND_PRIORITY_LOW,
		PASTE_COMMAND,
		type LexicalEditor,
		$getSelection as getSelection,
		$isElementNode as isElementNode,
		$isRangeSelection as isRangeSelection
	} from 'lexical';

	type Props = {
		editor: LexicalEditor;
		validateUrl?: (url: string) => boolean;
		attributes?: LinkAttributes;
	};

	let { editor, validateUrl, attributes }: Props = $props();

	$effect(() => {
		if (!editor.hasNodes([LinkNode])) {
			throw new Error('LinkPlugin: LinkNode not registered on editor');
		}

		const toggleLinkCommand = editor.registerCommand(
			TOGGLE_LINK_COMMAND,
			(payload) => {
				if (payload === null) {
					toggleLink(payload);
					return true;
				} else if (typeof payload === 'string') {
					if (validateUrl === undefined || validateUrl(payload)) {
						toggleLink(payload, attributes);
						return true;
					}
					return false;
				} else {
					const { url, target, rel, title } = payload;
					toggleLink(url, {
						...attributes,
						rel,
						target,
						title
					});
					return true;
				}
			},
			COMMAND_PRIORITY_LOW
		);

		const commands = [toggleLinkCommand];

		if (validateUrl) {
			const pasteCommand = editor.registerCommand(
				PASTE_COMMAND,
				(event) => {
					const selection = getSelection();
					if (
						!isRangeSelection(selection) ||
						selection.isCollapsed() ||
						!objectKlassEquals(event, ClipboardEvent)
					)
						return false;

					const clipboardEvent = event as ClipboardEvent;
					if (clipboardEvent.clipboardData === null) return false;

					const clipboardText = clipboardEvent.clipboardData.getData('text');
					if (!validateUrl(clipboardText)) return false;

					if (!selection.getNodes().some(isElementNode)) {
						editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
							...attributes,
							url: clipboardText
						});
						event.preventDefault();
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			);

			commands.push(pasteCommand);
		}

		return mergeRegister(...commands);
	});
</script>
