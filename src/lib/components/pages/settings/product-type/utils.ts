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

/**
 * In the product creation/edit pages, we support selecting at most 2 attributes for variant selection.
 * This constant defines that maximum number.
 */
export const MaximumVariantSelectionAttributes = 2;
