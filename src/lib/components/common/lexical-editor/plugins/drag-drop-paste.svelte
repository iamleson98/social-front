<script lang="ts">
	import { DRAG_DROP_PASTE } from '@lexical/rich-text';
	import { isMimeType, mediaFileReader } from '@lexical/utils';
	import { COMMAND_PRIORITY_LOW, type LexicalEditor } from 'lexical';
	import { INSERT_IMAGE_COMMAND } from './consts';

	type Props = {
		editor: LexicalEditor;
	};

	let { editor }: Props = $props();

	const ACCEPTABLE_IMAGE_TYPES = ['image/', 'image/heic', 'image/heif', 'image/gif', 'image/webp'];

	$effect(() => {
		editor.registerCommand(
			DRAG_DROP_PASTE,
			(files) => {
				mediaFileReader(
					files,
					[ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x)
				).then((filesResult) => {
					for (const { file, result } of filesResult) {
						if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
							editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
								altText: file.name,
								src: result
							});
						}
					}
				});

				return true;
			},
			COMMAND_PRIORITY_LOW
		);
	});
</script>

<div class="hidden!"></div>
