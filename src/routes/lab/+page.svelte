<script lang="ts">
	import { type LanguageCode, switchTranslationLanguage } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { LanguageCodeEnum } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { get, readable, readonly, writable } from 'svelte/store';

	const options: SelectOption[] = [
		{
			label: 'one',
			value: 'one',
		},
		{
			label: 'two',
			value: 'two',
		},
	];

	const store = writable(2);
	const read = readonly(store);

	// const lol = $derived(read);

	let languageCode = $state<LanguageCode>(LanguageCodeEnum.En);

	const toggleLanguage = async () => {
		await switchTranslationLanguage(
			languageCode === LanguageCodeEnum.En ? LanguageCodeEnum.Vi : LanguageCodeEnum.En,
		);
	};
</script>

<Button onclick={toggleLanguage}>toggle language</Button>

<div>{$CommonState.EditSuccess}</div>
