<h2>Welcome to translation project</h2>
<p>This is a translation project for social app. This is a reference for translators.</p>

<strong>1: Tutorial</strong>

```json
// 1) English version:
//
// ⬇️ this is the key, translators NEVER touch this
//         ⬇️ This is the value text, translator can make changes
{ "key": "This is sample translation for {{key}}." }
//                                       ⬆️ This is the parameter: {{key}}. You MUST keep it in your translation.


// 2) Vietnamese version:

{ "key": "Đây là phần dịch mẫu cho {{key}}." }

```

<h2>If you have any question, please ask me.</h2>

<!-- TODO: consider update translations for Korean and Japanese as well -->

Document:

You can make tran func usage key type safe, by:

1) cd <path_to_this_folder>
2) bun run .\translations_validator.ts --trans=en,vi

The result will be the file ./type.ts
