<script lang="ts">
	import { type LanguageCode, switchTranslationLanguage } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { LanguageCodeEnum } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { get, readable, readonly, writable } from 'svelte/store';
	import Com from './com.svelte';
	import { onMount } from 'svelte';
	import { randomString } from '$lib/utils/utils';

	let comRef = $state<any>();

	const update = () => {
		comRef.control(randomString(20));
	};
</script>

<Com bind:this={comRef} />

<Button onclick={update}>update</Button>
