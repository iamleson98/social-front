import { editorConfig } from "$lib/configs"
import { createEditor, type LexicalEditor } from "lexical"
import { derived, readable } from "svelte/store";

export const editorStore = readable<LexicalEditor>(createEditor(editorConfig));

export const activeEditorStore = derived(editorStore, (values, set) => {
  set(values);
});
