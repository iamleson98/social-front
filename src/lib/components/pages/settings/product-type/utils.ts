import { AttributeInputTypeEnum, type Attribute } from '$lib/gql/graphql';

export const canUseAttributeForVariantSelection = (attr: Attribute) => {
	return (
		attr.inputType &&
		[
			AttributeInputTypeEnum.Swatch,
			AttributeInputTypeEnum.Dropdown,
			AttributeInputTypeEnum.Multiselect,
		].includes(attr.inputType)
	);
};
