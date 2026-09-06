import { ProductMediaType, type CheckoutLine, type OrderLine } from '$lib/gql/graphql';

export const getThumbnailFromLine = (line: CheckoutLine) => {
        return (
                line.variant.media?.find(({ type }) => type === ProductMediaType.Image) ||
                line.variant.product.media?.find(({ type }) => type === ProductMediaType.Image)
        );
};

export const getSummaryLineProps = (line: CheckoutLine | OrderLine) => {
        if (line.__typename === 'CheckoutLine')
                return {
                        variantName: line.variant.translation?.name || line.variant.name,
                        productName: line.variant.product.translation?.name || line.variant.product.name,
                        productImage: getThumbnailFromLine(line),
                };

        return {
                variantName: (line as OrderLine).variantName,
                productName: (line as OrderLine).productName,
                productImage: (line as OrderLine).thumbnail,
        };
};

/**
 * Builds the small descriptor rendered under a summary line.
 * Since Saleor 3.22+, variant attribute values are no longer exposed through
 * `ProductVariant.attributes` (deprecated) — `assignedAttributes` only returns
 * the attribute metadata. The variant name (auto-generated from the selected
 * attribute values by Saleor) is the canonical way to describe a variant.
 */
export const useSummaryLineLineAttributesText = (line: CheckoutLine | OrderLine) => {
        const variantName = getSummaryLineProps(line).variantName;
        if (!variantName) return '';
        // variant names are usually built from attribute values; keep it short
        return variantName.length > PRODUCT_NAME_MAX_LENGTH
                ? variantName.slice(0, PRODUCT_NAME_MAX_LENGTH)
                : variantName;
};

export const PRODUCT_NAME_MAX_LENGTH = 60;
