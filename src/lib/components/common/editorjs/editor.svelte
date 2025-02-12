<script lang="ts">
	import { tranFunc } from '$i18n';
	import Alert from '$lib/components/ui/Alert/alert.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { noop } from 'es-toolkit';
	import { onMount } from 'svelte';

	type Props = {
		header?: {
			placeholder?: string;
			levels?: number[];
			defaultLevel?: number;
		};
		link?: {
			/** the endpoint for link data fetching */
			endpoint: string;
			/** the headers used in the GET request. */
			headers?: object;
		};
		simpleImage?: boolean;
		checklist?: {
			inlineToolbar?: boolean;
		};
		list?: {
			defaultStyle?: string;
			maxLevel?: number;
			inlineToolbar?: boolean;
		};
		embed?: {
			services: Record<'youtube', boolean>;
		};
		quote?: {
			inlineToolbar?: boolean;
			quotePlaceholder?: string;
			captionPlaceholder?: string;
		};
		onchange?: (data: any) => void;
		placeholder?: string;
	};

	let {
		header,
		link,
		simpleImage,
		checklist,
		list,
		embed,
		quote,
		onchange = noop,
		placeholder
	}: Props = $props();

	let editor = $state<any>();
	let editorElem = $state<HTMLDivElement>();
	let editorInitializing = $state(true);
	let editorInitError = $state<string | null>(null);

	onMount(async () => {
		const toolsConfig: { [toolName: string]: unknown } = {};

		if (header) {
			const headerImport = await import('@editorjs/header');
			toolsConfig.header = {
				class: headerImport.default,
				config: header
			};
		}
		if (link) {
			const linkImport = await import('@editorjs/link');
			toolsConfig.linkTool = {
				class: linkImport.default,
				config: link
			};
		}
		if (simpleImage) {
			const imageImport = await import('@editorjs/simple-image');
			toolsConfig.image = imageImport.default;
		}
		if (checklist) {
			const checkListImport = await import('@editorjs/checklist');
			toolsConfig.checklist = {
				class: checkListImport.default,
				inlineToolbar: checklist.inlineToolbar
			};
		}
		if (list) {
			const listImport = await import('@editorjs/list');
			toolsConfig.list = {
				class: listImport.default,
				inlineToolbar: list.inlineToolbar,
				config: {
					defaultStyle: list.defaultStyle,
					maxLevel: list.maxLevel
				}
			};
		}
		if (embed) {
			const embedImport = await import('@editorjs/embed');
			toolsConfig.embed = {
				class: embedImport.default,
				config: {
					services: embed.services
				}
			};
		}
		if (quote) {
			const quoteImport = await import('@editorjs/quote');
			toolsConfig.quote = {
				class: quoteImport.default,
				inlineToolbar: quote.inlineToolbar,
				config: {
					quotePlaceholder: quote.quotePlaceholder,
					captionPlaceholder: quote.captionPlaceholder
				}
			};
		}

		const ip = await import('@editorjs/editorjs');
		editor = new ip.default({
			holder: editorElem,
			hideToolbar: false,
			tools: toolsConfig as { [toolName: string]: any },
			placeholder,

			onChange(api, event) {
				api.saver.save().then(onchange);
			}
		});

		editor.isReady
			.catch(() => (editorInitError = $tranFunc('error.initEditorErr')))
			.finally(() => {
				editorInitializing = false;
			});
	});

	onMount(() => {
		return () => editor?.destroy();
	});
</script>

<div id="editorjs" bind:this={editorElem}>
	{#if editorInitError}
		<Alert size="md" variant="error">{editorInitError}</Alert>
	{:else if editorInitializing}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-6 w-full" />
		</SkeletonContainer>
	{/if}
</div>
