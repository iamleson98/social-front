<script lang="ts">
	import DescriptionEditorToolbar from './product-description-editor-toolbar.svelte';
	import { onMount } from 'svelte';
	import { mergeRegister } from '@lexical/utils';
	import { registerRichText } from '@lexical/rich-text';
	import { createEmptyHistoryState, registerHistory } from '@lexical/history';
	import {
		$getRoot as getRoot,
		CLEAR_EDITOR_COMMAND,
		COMMAND_PRIORITY_EDITOR,
		COMMAND_PRIORITY_LOW,
		createEditor,
		INSERT_PARAGRAPH_COMMAND,
		type LexicalEditor
	} from 'lexical';
	import {
		$handleListInsertParagraph as handleListInsertParagraph,
		INSERT_CHECK_LIST_COMMAND,
		INSERT_ORDERED_LIST_COMMAND,
		INSERT_UNORDERED_LIST_COMMAND,
		insertList,
		REMOVE_LIST_COMMAND,
		removeList
	} from '@lexical/list';
	import { editorConfig } from '$lib/configs';
	import { tClient } from '$i18n';

	type Props = {
		ariaActiveDescendantID?: string;
		ariaAutoComplete?: 'list' | 'none' | 'inline' | 'both' | null;
		ariaDescribedBy?: string;
		ariaControls?: string;
		ariaLabel?: string;
		ariaLabelledBy?: string;
		ariaMultiline?: boolean;
		ariaOwns?: string;
		ariaRequired?: boolean;
		autoCapitalize?:
			| 'none'
			| 'characters'
			| 'off'
			| 'on'
			| 'sentences'
			| 'words'
			| null
			| undefined;
		class?: string;
		id?: string;
		style?: string;
		testid?: string;
	};

	let {
		ariaActiveDescendantID,
		ariaAutoComplete = null,
		ariaControls,
		ariaDescribedBy,
		ariaLabel,
		ariaLabelledBy,
		ariaOwns,
		ariaMultiline,
		ariaRequired,
		autoCapitalize,
		testid,
		id,
		class: className = '',
		style
	}: Props = $props();

	let activeEditor = $state<LexicalEditor | undefined>(undefined);
	let isEditable = $state(true);

	let ref: HTMLDivElement;

	onMount(() => {
		activeEditor = createEditor(editorConfig);
		activeEditor.setRootElement(ref);

		return () => {
			activeEditor?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
		};
	});

	$effect(() => {
		if (!activeEditor) return;

		return mergeRegister(
			activeEditor.registerEditableListener((editable) => (isEditable = editable)),
			registerRichText(activeEditor),
			registerHistory(activeEditor, createEmptyHistoryState(), 1000),
			activeEditor.registerCommand(
				INSERT_ORDERED_LIST_COMMAND,
				() => {
					insertList(activeEditor as LexicalEditor, 'number');
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			activeEditor.registerCommand(
				INSERT_UNORDERED_LIST_COMMAND,
				() => {
					insertList(activeEditor as LexicalEditor, 'bullet');
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			activeEditor.registerCommand(
				INSERT_CHECK_LIST_COMMAND,
				() => {
					insertList(activeEditor as LexicalEditor, 'check');
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			activeEditor.registerCommand(
				REMOVE_LIST_COMMAND,
				() => {
					removeList(activeEditor as LexicalEditor);
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			activeEditor.registerCommand(
				INSERT_PARAGRAPH_COMMAND,
				handleListInsertParagraph,
				COMMAND_PRIORITY_LOW
			),
			activeEditor.registerCommand(
				CLEAR_EDITOR_COMMAND,
				() => {
					activeEditor?.update(() => {
						const root = getRoot();
						root.clear();
					});
					return true;
				},
				COMMAND_PRIORITY_EDITOR
			)
		);
	});
</script>

<div class="mb-3">
	<span class="text-sm">{tClient('product.prdDescription')}</span>
	<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
		<DescriptionEditorToolbar disabled={!isEditable || !activeEditor} editor={activeEditor} />
		<div
			bind:this={ref}
			aria-activedescendant={!isEditable ? undefined : ariaActiveDescendantID}
			aria-autocomplete={!isEditable ? 'none' : ariaAutoComplete}
			aria-controls={!isEditable ? undefined : ariaControls}
			aria-describedby={ariaDescribedBy}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			aria-multiline={ariaMultiline}
			aria-owns={!isEditable ? null : ariaOwns}
			aria-readonly={!isEditable ? true : undefined}
			aria-required={ariaRequired}
			autocapitalize={autoCapitalize}
			contenteditable={isEditable}
			data-testid={testid}
			{id}
			role="textbox"
			tabindex="0"
			spellcheck="true"
			{style}
			class={`${className} border rounded-sm text-sm block relative tab-size-[1] outline-0 outline-hidden p-2.5 min-h-36 tablet:p-2 bg-white`}
		></div>
	</div>
</div>
