<script lang="ts">
	import type { LexicalEditor } from 'lexical';
	import Link from './_link.svelte';
	import { validateUrl } from './consts';

	type Props = {
		hasLinkAttributes?: boolean;
		editor: LexicalEditor;
	};

	let { hasLinkAttributes = false, editor }: Props = $props();

	const attrs = hasLinkAttributes ? { rel: 'noopener noreferrer', target: '_blank' } : undefined;
</script>

<Link {validateUrl} attributes={attrs} {editor} />
