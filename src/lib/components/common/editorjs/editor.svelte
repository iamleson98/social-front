<script lang="ts">
	import { tranFunc } from '$i18n';
	import Alert from '$lib/components/ui/Alert/alert.svelte';
	import type { SocialSize } from '$lib/components/ui/common';
	import { INPUT_CLASSES, Label } from '$lib/components/ui/Input';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { SocialVariant } from '$lib/utils';
	import type { OutputData } from '@editorjs/editorjs';
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
		onchange?: (data: OutputData) => void;
		placeholder?: string;
		// defaultValue?: any;
		class?: string;
		value?: OutputData;
		label?: string;
		required?: boolean;
		size?: SocialSize | 'xxs';
		variant?: SocialVariant | 'ghost';
		subText?: string;
		disabled?: boolean;
	};

	let {
		header,
		link,
		simpleImage,
		checklist,
		list,
		embed,
		quote,
		onchange,
		placeholder,
		value = $bindable(),
		class: className = '',
		label,
		required,
		size = 'md',
		variant = 'info',
		subText,
		disabled,
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
				config: header,
			};
		}
		if (link) {
			const linkImport = await import('@editorjs/link');
			toolsConfig.linkTool = {
				class: linkImport.default,
				config: link,
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
				inlineToolbar: checklist.inlineToolbar,
			};
		}
		if (list) {
			const listImport = await import('@editorjs/list');
			toolsConfig.list = {
				class: listImport.default,
				inlineToolbar: list.inlineToolbar,
				config: {
					defaultStyle: list.defaultStyle,
					maxLevel: list.maxLevel,
				},
			};
		}
		if (embed) {
			const embedImport = await import('@editorjs/embed');
			toolsConfig.embed = {
				class: embedImport.default,
				config: {
					services: embed.services,
				},
			};
		}
		if (quote) {
			const quoteImport = await import('@editorjs/quote');
			toolsConfig.quote = {
				class: quoteImport.default,
				inlineToolbar: quote.inlineToolbar,
				config: {
					quotePlaceholder: quote.quotePlaceholder,
					captionPlaceholder: quote.captionPlaceholder,
				},
			};
		}

		const ip = await import('@editorjs/editorjs');
		editor = new ip.default({
			holder: editorElem,
			hideToolbar: false,
			tools: toolsConfig as { [toolName: string]: any },
			placeholder,
			data: value,

			onChange(api, _event) {
				api.saver.save().then((dt) => {
					value = dt;
					onchange?.(dt);
				});
			},
		});

		editor.isReady
			.catch(() => (editorInitError = $tranFunc('error.initEditorErr')))
			.finally(() => {
				editorInitializing = false;
			});

		return editor.destroy;
	});
</script>

<div class={className}>
	{#if label}
		<Label {required} {label} {size} {variant} requiredAtPos="end" />
	{/if}
	<div
		id="editorjs"
		bind:this={editorElem}
		class="text-sm p-1 rounded-lg transition-all ring-1 focus:ring-2 duration-200 focus-within:ring-2 ease-in-out hover:ring-2 placeholder:opacity-55 {INPUT_CLASSES[
			variant
		].bg}"
		class:pointer-events-none!={disabled}
		class:cursor-not-allowed!={disabled}
		class:text-gray-400!={disabled}
	>
		{#if editorInitError}
			<Alert size="md" variant="error">{editorInitError}</Alert>
		{:else if editorInitializing}
			<SkeletonContainer class="w-full">
				<Skeleton class="h-6 w-full" />
			</SkeletonContainer>
		{/if}
	</div>
	{#if subText}
		<div class={`text-[10px] mt-0.5 text-right! ${INPUT_CLASSES[variant].fg}`}>{subText}</div>
	{/if}
</div>
