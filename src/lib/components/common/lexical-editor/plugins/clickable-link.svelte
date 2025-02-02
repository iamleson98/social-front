<script lang="ts">
	import { $isLinkNode as isLinkNode } from '@lexical/link';
	import { $findMatchingParent as findMatchingParent } from '@lexical/utils';
	import {
		$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
		$getSelection as getSelection,
		$isElementNode as isElementNode,
		$isRangeSelection as isRangeSelection,
		getNearestEditorFromDOMNode,
		isDOMNode,
		isHTMLAnchorElement,
		type LexicalEditor
	} from 'lexical';
	import { findMatchingDOM } from './consts';

	type Props = {
		editor: LexicalEditor;
		newTab?: boolean;
	};

	let { editor, newTab = true }: Props = $props();

	const onClick = (event: MouseEvent) => {
		const target = event.target;
		if (!isDOMNode(target)) {
			return;
		}
		const nearestEditor = getNearestEditorFromDOMNode(target);

		if (nearestEditor === null) {
			return;
		}

		let url = null;
		let urlTarget = null;
		nearestEditor.update(() => {
			const clickedNode = getNearestNodeFromDOMNode(target);
			if (clickedNode !== null) {
				const maybeLinkNode = findMatchingParent(clickedNode, isElementNode);
				if (!editor.isEditable()) {
					if (isLinkNode(maybeLinkNode)) {
						url = maybeLinkNode.sanitizeUrl(maybeLinkNode.getURL());
						urlTarget = maybeLinkNode.getTarget();
					} else {
						const a = findMatchingDOM(target, isHTMLAnchorElement);
						if (a !== null) {
							url = a.href;
							urlTarget = a.target;
						}
					}
				}
			}
		});

		if (url === null || url === '') {
			return;
		}

		// Allow user to select link text without follwing url
		const selection = editor.getEditorState().read(getSelection);
		if (isRangeSelection(selection) && !selection.isCollapsed()) {
			event.preventDefault();
			return;
		}

		const isMiddle = event.type === 'auxclick' && event.button === 1;
		window.open(
			url,
			newTab || isMiddle || event.metaKey || event.ctrlKey || urlTarget === '_blank'
				? '_blank'
				: '_self'
		);
		event.preventDefault();
	};

	const onMouseUp = (event: MouseEvent) => {
		if (event.button === 1) {
			onClick(event);
		}
	};

	$effect(() => {
		return editor.registerRootListener((rootElement, prevRootElement) => {
			if (prevRootElement !== null) {
				prevRootElement.removeEventListener('click', onClick);
				prevRootElement.removeEventListener('mouseup', onMouseUp);
			}
			if (rootElement !== null) {
				rootElement.addEventListener('click', onClick);
				rootElement.addEventListener('mouseup', onMouseUp);
			}
		});
	});
</script>
