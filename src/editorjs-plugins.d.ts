/**
 * Minimal ambient module declarations for Editor.js plugins that ship as
 * untyped ESM builds (`dist/*.mjs` without accompanying `.d.ts`). Without
 * these, `import('@editorjs/...')` fails type-checking with
 * "Could not find a declaration file for module ...".
 *
 * Each plugin's default export is an Editor.js tool constructor — tool
 * configuration is plugin-specific and only used at runtime, so a minimal
 * constructable shape keeps the call sites honest without inventing APIs.
 */

type EditorJsToolConfig = Record<string, unknown>;

interface EditorJsToolConstructor {
	new (config?: EditorJsToolConfig, ...args: unknown[]): unknown;
	(config?: EditorJsToolConfig, ...args: unknown[]): unknown;
}

declare module '@editorjs/header' {
	const Header: EditorJsToolConstructor;
	export default Header;
}

declare module '@editorjs/link' {
	const Link: EditorJsToolConstructor;
	export default Link;
}

declare module '@editorjs/simple-image' {
	const SimpleImage: EditorJsToolConstructor;
	export default SimpleImage;
}

declare module '@editorjs/checklist' {
	const Checklist: EditorJsToolConstructor;
	export default Checklist;
}

declare module '@editorjs/embed' {
	const Embed: EditorJsToolConstructor;
	export default Embed;
}
