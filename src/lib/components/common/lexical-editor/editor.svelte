<script lang="ts">
	import { $isListNode as isListNode, ListNode } from '@lexical/list';
	import {
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		$isRootOrShadowRoot as isRootOrShadowRoot,
		COMMAND_PRIORITY_CRITICAL,
		SELECTION_CHANGE_COMMAND,
		CAN_UNDO_COMMAND,
		CAN_REDO_COMMAND,
		type NodeKey,
		type TextFormatType,
		FORMAT_TEXT_COMMAND
	} from 'lexical';
	import {
		$getNearestNodeOfType as getNearestNodeOfType,
		$findMatchingParent as findMatchingParent,
		$isEditorIsNestedEditor as isEditorIsNestedEditor,
		mergeRegister
	} from '@lexical/utils';
	import {
		blockTypeToBlockName,
		defaultInlineFormats,
		getSelectedNode
	} from '$lib/configs/lexical';
	import { $isLinkNode as isLinkNode } from '@lexical/link';
	import {
		$getSelectionStyleValueForProperty as getSelectionStyleValueForProperty,
		$patchStyleText as patchStyleText
	} from '@lexical/selection';
	import { $isHeadingNode as isHeadingNode, registerRichText } from '@lexical/rich-text';
	import { getEditor } from '$lib/stores/app/editor';
	import { Icon } from '$lib/components/icons';
	import { onMount, tick } from 'svelte';

	const inlineFormatsKeys = Object.keys(defaultInlineFormats) as Exclude<TextFormatType, 'code'>[];
	let editorRoot: HTMLDivElement;
	let inlineFormats = $state.frozen({ ...defaultInlineFormats });
	let activeEditor = $state(getEditor());
	let isImageCaption = $state<boolean>(false);
	let isLink = $state<boolean>(false);
	let isEditable = $state<boolean>(true);
	let canUndo = $state<boolean>(false);
	let canRedo = $state<boolean>(false);
	let selectedElementKey = $state<NodeKey | null>(null);
	let blockType = $state<keyof typeof blockTypeToBlockName>('paragraph');
	let fontColor = $state('#000');
	let bgColor = $state('#fff');

	/** callback that fires everytime the editor state is changed */
	const updateToolbar = async () => {
		const selection = getSelection();
		if (selection && isRangeSelection(selection)) {
			if (isEditorIsNestedEditor(activeEditor)) {
				const rootElement = activeEditor.getRootElement();
				isImageCaption =
					!!rootElement?.parentElement?.classList.contains('image-caption-container');
			} else {
				isImageCaption = false;
			}

			const anchorNode = selection.anchor.getNode();
			let element =
				anchorNode.getKey() === 'root'
					? anchorNode
					: findMatchingParent(anchorNode, (e) => {
							const parent = e.getParent();
							return parent !== null && isRootOrShadowRoot(parent);
						});

			if (!element) {
				element = anchorNode.getTopLevelElementOrThrow();
			}

			const elementKey = element.getKey();
			const elementDOM = activeEditor?.getElementByKey(elementKey);

			if (elementDOM) {
				selectedElementKey = elementKey;
				if (isListNode(element)) {
					const parentList = getNearestNodeOfType<ListNode>(anchorNode, ListNode);
					const type = parentList ? parentList.getListType() : element.getListType();
					blockType = type;
				} else {
					const type = isHeadingNode(element) ? element.getTag() : element.getType();

					if (type in blockTypeToBlockName) {
						blockType = type;
					}
				}
			}

			// update text format
			inlineFormats = {
				// ...inlineFormats,
				bold: {
					...inlineFormats.bold,
					active: selection.hasFormat('bold')
				},
				italic: {
					...inlineFormats.italic,
					active: selection.hasFormat('italic')
				},
				underline: {
					...inlineFormats.underline,
					active: selection.hasFormat('underline')
				},
				subscript: {
					...inlineFormats.subscript,
					active: selection.hasFormat('subscript')
				},
				superscript: {
					...inlineFormats.superscript,
					active: selection.hasFormat('superscript')
				},
				strikethrough: {
					...inlineFormats.strikethrough,
					active: selection.hasFormat('strikethrough')
				},
				highlight: {
					...inlineFormats.highlight,
					active: selection.hasFormat('highlight')
				}
			};

			// update links
			const node = getSelectedNode(selection);
			const parent = node.getParent();
			isLink = isLinkNode(parent) || isLinkNode(node);

			// handle button
			fontColor = getSelectionStyleValueForProperty(selection, 'color', '#000');
			bgColor = getSelectionStyleValueForProperty(selection, 'background-color', '#fff');
		}
	};

	$effect(() => {
		activeEditor.getEditorState().read(updateToolbar);
	});

	onMount(() => {
		console.log('..........');
		activeEditor.setRootElement(editorRoot);
		tick();

		// activeEditor.getEditorState().read(updateToolbar);

		return mergeRegister(
			registerRichText(activeEditor),
			activeEditor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, newEditor) => {
					activeEditor = newEditor;
					updateToolbar();
					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			),
			activeEditor.registerEditableListener((editable) => (isEditable = editable)),
			activeEditor.registerUpdateListener(({ editorState }) => editorState.read(updateToolbar)),
			activeEditor.registerCommand(
				CAN_UNDO_COMMAND,
				(canUndo_) => (canUndo = canUndo_),
				COMMAND_PRIORITY_CRITICAL
			),
			activeEditor.registerCommand(
				CAN_REDO_COMMAND,
				(canRedo_) => (canRedo = canRedo_),
				COMMAND_PRIORITY_CRITICAL
			)
		);
	});

	const applyStyleText = (styles: Record<string, string>, skipHistoryStack?: boolean) => {
		activeEditor?.update(
			() => {
				const selection = getSelection();
				if (selection !== null) {
					patchStyleText(selection, styles);
				}
			},
			skipHistoryStack ? { tag: 'historic' } : {}
		);
	};

	const onFontColorSelect = (color: string, skipHistoryStack?: boolean) => {
		applyStyleText({ color }, skipHistoryStack);
	};

	const onBgColorSelect = (color: string, skipHistoryStack?: boolean) => {
		applyStyleText({ 'background-color': color }, skipHistoryStack);
	};
</script>

<div>
	<!-- toolbar -->
	<div class="flex items-center gap-1">
		{#each inlineFormatsKeys as formatName, idx (idx)}
			{@const format = inlineFormats[formatName]}

			<div class="tooltip" data-tip={format.tip}>
				<button
					class="btn btn-square btn-sm !border-none"
					class:!bg-blue-100={format.active}
					class:!text-blue-600={format.active}
					tabindex="0"
					onclick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, formatName)}
				>
					<Icon icon={format.icon} />
				</button>
			</div>
		{/each}
	</div>

	<!-- editor -->
	<div
		bind:this={editorRoot}
		contenteditable="true"
		aria-placeholder="Enter something"
		role="textbox"
		spellcheck="true"
		data-lexical-editor="true"
		class=" border-none text-sm block relative outline-0 p-2 min-h-40 bg-white"
	></div>
</div>
