<script lang="ts">
  import { onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

  let elem: HTMLDivElement;
  let editor = $state<Editor>();

  onMount(() => {
    editor = new Editor({
			element: elem,
			extensions: [StarterKit],
			content: '<p>Hello World! 🌍️ </p>',
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
		});

    return () => editor?.destroy();
  })
</script>

<div bind:this={elem}></div>
