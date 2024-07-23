<script lang="ts">
	import { editorConfig } from '$lib/configs';
	import { registerDragonSupport } from '@lexical/dragon';
	import { createEmptyHistoryState, registerHistory } from '@lexical/history';
	import { registerRichText } from '@lexical/rich-text';
	import { mergeRegister } from '@lexical/utils';
	import { type LexicalEditor, createEditor, $getSelection as getSelection } from 'lexical';
	import { onMount, tick } from 'svelte';

	let editorRoot: HTMLDivElement;
	let lexicalEditor: LexicalEditor | null = null;
	let editorState: string = '';
	let now = new Date();

	const handleEditorUpdate = () => {
		const selection = getSelection();
		console.log(selection);
	};

	onMount(() => {
		lexicalEditor = createEditor(editorConfig);
		lexicalEditor.setRootElement(editorRoot);
		// lexicalEditor.update(handleEditorUpdate, { tag: 'history-merge' });

		tick();
		mergeRegister(
			registerRichText(lexicalEditor),
			registerDragonSupport(lexicalEditor),
			registerHistory(lexicalEditor, createEmptyHistoryState(), 300)
			// registerEmoji(lexicalEditor)
		);
	});

	function registerEmoji(lexicalEditor: LexicalEditor): () => void {
		throw new Error('Function not implemented.');
	}
</script>

<div>
	<h1>Add new product</h1>

	<div class="m-auto rounded bg-white max-w-[800px] p-5">
		<!-- product name -->
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text text-lg font-semibold">Product name</span>
				<!-- <span class="label-text-alt">Top Right label</span> -->
			</div>
			<input type="text" placeholder="Enter the product name" class="input input-bordered w-full" />
			<div class="label">
				<span class="label-text-alt"></span>
				<span class="label-text-alt">{now.toDateString()}</span>
			</div>
		</label>

		<!-- description -->

		<div class="label">
			<span class="label-text text-lg font-semibold">Product description</span>
		</div>
		<div bind:this={editorRoot} contenteditable></div>
	</div>
</div>
