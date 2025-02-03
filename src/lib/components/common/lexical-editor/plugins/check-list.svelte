<script lang="ts">
	import {
		$isListItemNode as isListItemNode,
		INSERT_CHECK_LIST_COMMAND,
		insertList,
		$isListNode as isListNode
	} from '@lexical/list';
	import {
		$findMatchingParent as findMatchingParent,
		mergeRegister
	} from '@lexical/utils';
	import {
		$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
		COMMAND_PRIORITY_LOW,
		KEY_ARROW_DOWN_COMMAND,
		KEY_ARROW_UP_COMMAND,
		KEY_ESCAPE_COMMAND,
		KEY_SPACE_COMMAND,
		type LexicalEditor,
		KEY_ARROW_LEFT_COMMAND,
		$isRangeSelection as isRangeSelection,
		$isElementNode as isElementNode,
		$getSelection as getSelection
	} from 'lexical';
	import { getActiveCheckListItem, handleArrownUpOrDown, handleCheckListItemClick, handleChecklistItemPointerDown } from './consts';

	type Props = {
		editor?: LexicalEditor;
	};

	let { editor }: Props = $props();

	$effect(() => {
		if (!editor) return;

		return mergeRegister(
			editor.registerCommand(
				INSERT_CHECK_LIST_COMMAND,
				() => {
					insertList(editor, 'check');
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand<KeyboardEvent>(
				KEY_ARROW_DOWN_COMMAND,
				(event) => {
					return handleArrownUpOrDown(event, editor, false);
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand<KeyboardEvent>(
				KEY_ARROW_UP_COMMAND,
				(event) => {
					return handleArrownUpOrDown(event, editor, true);
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand<KeyboardEvent>(
				KEY_ESCAPE_COMMAND,
				(event) => {
					const activeItem = getActiveCheckListItem();

					if (activeItem != null) {
						const rootElement = editor.getRootElement();

						if (rootElement != null) {
							rootElement.focus();
						}

						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand<KeyboardEvent>(
				KEY_SPACE_COMMAND,
				(event) => {
					const activeItem = getActiveCheckListItem();

					if (activeItem != null && editor.isEditable()) {
						editor.update(() => {
							const listItemNode = getNearestNodeFromDOMNode(activeItem);

							if (isListItemNode(listItemNode)) {
								event.preventDefault();
								listItemNode.toggleChecked();
							}
						});
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand<KeyboardEvent>(
				KEY_ARROW_LEFT_COMMAND,
				(event) => {
					return editor.getEditorState().read(() => {
						const selection = getSelection();

						if (isRangeSelection(selection) && selection.isCollapsed()) {
							const { anchor } = selection;
							const isElement = anchor.type === 'element';

							if (isElement || anchor.offset === 0) {
								const anchorNode = anchor.getNode();
								const elementNode = findMatchingParent(
									anchorNode,
									(node) => isElementNode(node) && !node.isInline()
								);
								if (isListItemNode(elementNode)) {
									const parent = elementNode.getParent();
									if (
										isListNode(parent) &&
										parent.getListType() === 'check' &&
										(isElement || elementNode.getFirstDescendant() === anchorNode)
									) {
										const domNode = editor.getElementByKey(elementNode.__key);

										if (domNode != null && document.activeElement !== domNode) {
											domNode.focus();
											event.preventDefault();
											return true;
										}
									}
								}
							}
						}

						return false;
					});
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerRootListener((rootElement, prevElement) => {
				if (rootElement !== null) {
					rootElement.addEventListener('click', handleCheckListItemClick);
					rootElement.addEventListener('pointerdown', handleChecklistItemPointerDown);
				}

				if (prevElement !== null) {
					prevElement.removeEventListener('click', handleCheckListItemClick);
					prevElement.removeEventListener('pointerdown', handleChecklistItemPointerDown);
				}
			})
		);
	});
</script>
