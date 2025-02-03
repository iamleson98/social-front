<script lang="ts">
	import { ChevronDown } from '$lib/components/icons';
	import {
		defaultBlockFormats,
		DEFAULT_INLINE_FORMATS,
		type BlockType,
		type InlineType,
		type Styleformat
	} from '$lib/configs/lexical';
	import {
		$isRangeSelection as isRangeSelection,
		FORMAT_TEXT_COMMAND,
		$isRootOrShadowRoot as isRootOrShadowRoot,
		type LexicalEditor,
		$getSelection as getSelection,
		$createParagraphNode as createParagraphNode
	} from 'lexical';
	import {
		$getNearestNodeOfType as getNearestNodeOfType,
		$findMatchingParent as findMatchingParent
	} from '@lexical/utils';
	import {
		$isListNode as isListNode,
		INSERT_CHECK_LIST_COMMAND,
		INSERT_ORDERED_LIST_COMMAND,
		INSERT_UNORDERED_LIST_COMMAND,
		ListNode
	} from '@lexical/list';
	import {
		$createHeadingNode as createHeadingNode,
		$createQuoteNode as createQuoteNode,
		$isHeadingNode as isHeadingNode
	} from '@lexical/rich-text';
	import { $setBlocksType as setBlocksType } from '@lexical/selection';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem, type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';

	type Props = {
		/** indicates if editing mode is allowed */
		disabled: boolean;
		editor?: LexicalEditor;
	};

	let { disabled, editor }: Props = $props();

	let blockFormatState = $state.raw({ ...defaultBlockFormats });
	let inlineFormatState = $state.raw({ ...DEFAULT_INLINE_FORMATS });

	let blockFormatType = $state<BlockType>('paragraph');
	let selectedElementKey = $state<string | null>(null);
	let __openBlockFormatDropdown = $state(false);

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
			const newInlineState = {} as Record<InlineType, Styleformat>;
			for (let key in inlineFormatState) {
				newInlineState[key as InlineType] = {
					icon: inlineFormatState[key as InlineType].icon,
					tip: inlineFormatState[key as InlineType].tip,
					active: selection.hasFormat(key as InlineType)
				};
			}

			inlineFormatState = newInlineState;

			const elementKey = element.getKey();
			const elementDOM = editor?.getElementByKey(elementKey);

			if (elementDOM !== null) {
				selectedElementKey = elementKey;

				if (isListNode(element)) {
					const parentList = getNearestNodeOfType(anchorNode, ListNode);
					blockFormatType = parentList ? parentList.getListType() : element.getListType();
				} else {
					const type = isHeadingNode(element) ? element.getTag() : element.getType();
					if (type in defaultBlockFormats) {
						blockFormatType = type as BlockType;
					}
				}
			}
		}
	};

	$effect(() => {
		if (editor)
			return editor.registerUpdateListener(({ editorState }) => editorState.read(updateToolbarUI));
	});

	const applyBlockFormat = (type: BlockType) => {
		__openBlockFormatDropdown = false;

		if (blockFormatType !== type && editor) {
			if (type === 'bullet') {
				editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
			} else if (type === 'check') {
				editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
			} else if (type === 'number') {
				editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
			} else if (['h2', 'h3', 'quote', 'paragraph'].includes(type)) {
				editor.update(() => {
					const selection = getSelection();
					setBlocksType(selection, () => {
						if (type === 'paragraph') {
							return createParagraphNode();
						} else if (type === 'h2' || type === 'h3') {
							return createHeadingNode(type);
						}
						return createQuoteNode();
					});
				});
			}
		}
	};
</script>

<div
	class="inline-flex items-center gap-2 mb-2 sticky top-13 z-199 bg-white p-1.5 rounded-lg border border-gray-200"
>
	<!-- block format -->
	{#snippet trigger({ onclick, onfocus }: DropdownTriggerInterface)}
		<Button endIcon={ChevronDown} {onclick} {onfocus} size="sm" {disabled} variant="light">
			click
		</Button>
	{/snippet}
	<DropDown {trigger} placement="bottom-start" bind:open={__openBlockFormatDropdown}>
		{#each Object.keys(blockFormatState) as blockKey, idx (idx)}
			{@const blockFormat = blockFormatState[blockKey as BlockType]}
			<MenuItem
				startIcon={blockFormat.icon}
				onclick={() => applyBlockFormat(blockKey as BlockType)}
				class={`${blockFormatType === blockKey ? 'bg-blue-100! text-blue-600!' : ''}`}
			>
				{blockFormat.tip}
			</MenuItem>
		{/each}
	</DropDown>

	<!-- inline format -->
	<div class="flex items-center gap-1.5">
		{#each Object.keys(inlineFormatState) as inlineKey, idx (idx)}
			{@const inlineFormat = inlineFormatState[inlineKey as InlineType]}

			<div class="tooltip tooltip-bottom" data-tip={inlineFormat.tip}>
				<IconButton
					icon={inlineFormat.icon}
					aria-label={inlineKey}
					tabindex={0}
					{disabled}
					onclick={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, inlineKey as InlineType)}
					variant="light"
					color={inlineFormat.active ? 'blue' : 'gray'}
					size="sm"
				/>
			</div>
		{/each}
	</div>
</div>
