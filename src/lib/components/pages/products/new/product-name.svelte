<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Input } from '$lib/components/ui/Input';
	import type { ProductCreateInput } from '$lib/gql/graphql';
	import { string } from 'zod';
	import { PRODUCT_NAME_MAX_LENGTH } from './utils';

	type Props = {
		name: ProductCreateInput['name'];
		ok: boolean;
	};

	let { name = $bindable(), ok = $bindable() }: Props = $props();
	let nameError = $state('');
	let nameCharCount = $derived(`${name?.trim().length || 0}/${PRODUCT_NAME_MAX_LENGTH}`);

	$effect(() => {
		ok = !nameError;
	});

	const nameSchema = string()
		.min(1, { message: $tranFunc('helpText.fieldRequired') })
		.max(PRODUCT_NAME_MAX_LENGTH, {
			message: $tranFunc('error.lengthInvalid', {
				min: 1,
				max: PRODUCT_NAME_MAX_LENGTH,
				name: $tranFunc('common.name')
			})
		});

	const handleNameChange = () => {
		const result = nameSchema.safeParse(name);
		if (!result.success) {
			nameError = result.error.formErrors.formErrors[0];
		} else {
			nameError = '';
		}
	};
</script>

<!-- product name -->
<div class="mb-2">
	<!-- <RequiredAt class="text-sm" label={$tranFunc('product.prdName')} required /> -->
	<Input
		placeholder={$tranFunc('placeholders.enterPrdName')}
		size="md"
		bind:value={name}
		onblur={handleNameChange}
		inputDebounceOption={{ onInput: handleNameChange }}
		variant={nameError ? 'error' : undefined}
		subText={nameError || nameCharCount}
		required
		label={$tranFunc('product.prdName')}
	/>
</div>
