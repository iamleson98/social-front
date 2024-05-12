<script lang="ts">
	import { editorConfig } from '$lib/configs';
	import { type LexicalEditor, createEditor } from 'lexical';
	import { onMount } from 'svelte';

	let editorRoot: HTMLDivElement;
	let lexicalEditor: LexicalEditor | null = null;
	let editorState: string = '';

	onMount(() => {
		lexicalEditor = createEditor(editorConfig);
		lexicalEditor.setRootElement(editorRoot);
	});

	$: {
		if (lexicalEditor) {
			editorState = JSON.stringify(lexicalEditor.getEditorState().toJSON());
		}
	}
</script>

<svelte:head>
	<title>New Product</title>
</svelte:head>

<div bind:this={editorRoot}></div>

<p>{editorState}</p>
