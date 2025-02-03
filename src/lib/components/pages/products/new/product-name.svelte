<script lang="ts">
	import { tranFunc } from '$i18n';
	import { RequiredAt } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import type { ProductCreateInput } from '$lib/gql/graphql';
	import { string } from 'zod';

	const MAX_LENGTH = 250; // saleor reference

	type Props = {
		name: ProductCreateInput['name'];
	};

	let { name = $bindable() }: Props = $props();
	let nameError = $state('');
	let nameCharCount = $derived(`${name?.trim().length}/${MAX_LENGTH}`);

	const nameSchema = string()
		.min(1, { message: $tranFunc('helpText.fieldRequired') })
		.max(MAX_LENGTH, {
			message: $tranFunc('error.lengthInvalid', {
				min: 1,
				max: MAX_LENGTH,
				name: $tranFunc('common.name')
			})
		});

	const now = new Date();

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
	<RequiredAt class="text-sm" label={$tranFunc('product.prdName')} required />
	<Input
		placeholder={$tranFunc('placeholders.enterPrdName')}
		size="md"
		bind:value={name}
		onblur={handleNameChange}
		inputDebounceOption={{ onInput: handleNameChange }}
		variant={nameError ? 'error' : undefined}
		subText={nameError || nameCharCount}
	/>
	<div class="text-right">
		<span class="text-xs">{now.toDateString()}</span>
	</div>
</div>
