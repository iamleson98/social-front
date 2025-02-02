<script lang="ts">
	import type { LexicalEditor } from "lexical";

  type Props = {
    editor: LexicalEditor;
  };

  let { editor }: Props = $props();

  $effect(() => {
    // if (!editor.hasNodes([Youtube]))
  })
</script>
