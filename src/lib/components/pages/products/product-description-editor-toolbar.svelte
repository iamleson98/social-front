<script lang="ts">
	import { ChevronDown, Icon } from '$lib/components/icons';
	import { defaultBlockFormats, defaultInlineFormats } from '$lib/configs/lexical';
	import {
		$isRangeSelection as isRangeSelection,
		FORMAT_TEXT_COMMAND,
		$isRootOrShadowRoot as isRootOrShadowRoot,
		type LexicalEditor,
		$getSelection as getSelection
	} from 'lexical';
	import {
		$getNearestNodeOfType as getNearestNodeOfType,
		$findMatchingParent as findMatchingParent,
	} from '@lexical/utils';
	import {
		$isListNode as isListNode,
		$handleListInsertParagraph as handleListInsertParagraph,
		INSERT_CHECK_LIST_COMMAND,
		INSERT_ORDERED_LIST_COMMAND,
		INSERT_UNORDERED_LIST_COMMAND,
		insertList,
		REMOVE_LIST_COMMAND,
		removeList,
		ListNode
	} from '@lexical/list';

	type Props = {
		/** indicates if editing mode is allowed */
		disabled: boolean;
		editor?: LexicalEditor;
	};

	let { disabled, editor }: Props = $props();

	let blockFormatState = $state.frozen({ ...defaultBlockFormats });
	let inlineFormatState = $state.frozen({ ...defaultInlineFormats });

	const blockFormatKeys = Object.keys(defaultBlockFormats) as Array<
		keyof typeof defaultBlockFormats
	>;

	const inlineFormatKeys = Object.keys(defaultInlineFormats) as Array<
		keyof typeof defaultInlineFormats
	>;

	/** invoked every times a change is made */
	const updateToolbarUI = async () => {
		const selection = getSelection();
		if (selection && isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode();
			let element =
				anchorNode.getKey() === 'root'
					? anchorNode
					: findMatchingParent(anchorNode, (e) => {
							const parent = e.getParent();
							return parent !== null && isRootOrShadowRoot(parent);
						});

			if (element === null) {
				element = anchorNode.getTopLevelElementOrThrow();
			}

			// update inline formats
			inlineFormatState = {
				...inlineFormatState,
				bold: {
					...inlineFormatState.bold,
					active: selection.hasFormat('bold')
				},
				italic: {
					...inlineFormatState.italic,
					active: selection.hasFormat('italic')
				},
				underline: {
					...inlineFormatState.underline,
					active: selection.hasFormat('underline')
				},
				strikethrough: {
					...inlineFormatState.strikethrough,
					active: selection.hasFormat('strikethrough')
				},
				subscript: {
					...inlineFormatState.subscript,
					active: selection.hasFormat('subscript')
				},
				superscript: {
					...inlineFormatState.superscript,
					active: selection.hasFormat('superscript')
				},
				highlight: {
					...inlineFormatState.highlight,
					active: selection.hasFormat('highlight')
				}
			};

			const elementKey = element.getKey();
			const elementDOM = editor?.getElementByKey(elementKey);

			if (elementDOM !== null) {
				if (isListNode(element)) {
					const parentList = getNearestNodeOfType(anchorNode, ListNode);
					const type = parentList ? parentList.getListType() : element.getListType();
				}
			}
		}
	};

	$effect(() => {
		if (editor)
			return editor.registerUpdateListener(({ editorState }) => editorState.read(updateToolbarUI));
	});
</script>

<div class="flex items-center gap-1">
	<!-- block format -->
	<div class="dropdown dropdown-bottom">
		<button class="btn btn-sm no-animation" tabindex="0" {disabled}>
			Click
			<Icon icon={ChevronDown} />
		</button>
		<ul class="dropdown-content menu bg-base-100 rounded z-10 p-1">
			{#each blockFormatKeys as blockKey, idx (idx)}
				{@const blockFormat = blockFormatState[blockKey]}

				<li>
					<span class="flex items-center gap-2 px-2 py-1 justify-start">
						<Icon icon={blockFormat.icon} class="mr-2" />
						<span>
							{blockKey}
						</span>
					</span>
				</li>
			{/each}
		</ul>
	</div>

	<!-- inline format -->
	<div class="flex items-center gap-1">
		{#each inlineFormatKeys as inlineKey, idx (idx)}
			{@const inlineFormat = inlineFormatState[inlineKey]}

			<button
				class="inline-format-button btn btn-square btn-sm"
				class:!bg-blue-100={inlineFormat.active}
				class:!text-blue-600={inlineFormat.active}
				tabindex="0"
				aria-label={inlineKey}
				onclick={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, inlineKey)}
				{disabled}
			>
				<Icon icon={inlineFormat.icon} />
			</button>
		{/each}
	</div>
</div>

<style lang="postcss">
	.inline-format-button {
		@apply !outline-0 !border-none no-animation hover:bg-blue-100 hover:text-blue-600 !shadow-none;
	}
</style>
