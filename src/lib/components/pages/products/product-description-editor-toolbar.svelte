<script lang="ts">
	import { ChevronDown, Icon } from '$lib/components/icons';
	import {
		defaultBlockFormats,
		defaultInlineFormats,
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
	import { IconButton } from '$lib/components/ui/Button';

	type Props = {
		/** indicates if editing mode is allowed */
		disabled: boolean;
		editor?: LexicalEditor;
	};

	let { disabled, editor }: Props = $props();

	let blockFormatState = $state.raw({ ...defaultBlockFormats });
	let inlineFormatState = $state.raw({ ...defaultInlineFormats });

	let blockFormatType = $state<BlockType>('paragraph');
	let selectedElementKey = $state<string | null>(null);

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

<div class="flex items-center gap-1 mb-2">
	<!-- block format -->
	<div class="dropdown dropdown-bottom">
		<button class="btn btn-sm no-animation" tabindex="0" {disabled}>
			Click
			<Icon icon={ChevronDown} />
		</button>
		<ul class="dropdown-content menu bg-base-100 z-10 shadow rounded w-52">
			{#each Object.keys(blockFormatState) as blockKey, idx (idx)}
				{@const blockFormat = blockFormatState[blockKey as BlockType]}
				<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					class:!bg-blue-100={blockFormatType === blockKey}
					class:!text-blue-600={blockFormatType === blockKey}
					role="button"
					tabindex="0"
					onclick={() => applyBlockFormat(blockKey as BlockType)}
					class="rounded-md"
				>
					<!-- svelte-ignore a11y_missing_attribute -->
					<a>
						<Icon icon={blockFormat.icon} />
						{blockFormat.tip}
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<!-- inline format -->
	<div class="flex items-center gap-1">
		{#each Object.keys(inlineFormatState) as inlineKey, idx (idx)}
			{@const inlineFormat = inlineFormatState[inlineKey as InlineType]}

			<div class="tooltip" data-tip={inlineFormat.tip}>
				<!-- <button
					class="inline-format-button btn btn-square btn-sm"
					class:!bg-blue-100={inlineFormat.active}
					class:!text-blue-600={inlineFormat.active}
					tabindex="0"
					aria-label={inlineKey}
					onclick={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, inlineKey as InlineType)}
					{disabled}
				>
					<Icon icon={inlineFormat.icon} />
				</button> -->
				<IconButton
					icon={inlineFormat.icon}
					class={`${inlineFormat.active ? '!bg-blue-100 !text-blue-600' : ''}`}
					aria-label={inlineKey}
					tabindex={0}
					{disabled}
					onclick={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, inlineKey as InlineType)}
				/>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	.inline-format-button {
		@apply !outline-0 !border-none hover:bg-blue-100 hover:text-blue-600 !shadow-none;
	}
</style>
