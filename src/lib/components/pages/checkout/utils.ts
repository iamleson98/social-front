import { ProductMediaType, type CheckoutLine, type OrderLine } from "$lib/gql/graphql";


export const getThumbnailFromLine = (line: CheckoutLine) => {
  return line.variant.media?.find(({ type }) => type === ProductMediaType.Image) ||
    line.variant.product.media?.find(({ type }) => type === ProductMediaType.Image);
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

const formatter = new Intl.DateTimeFormat("EN-US", { dateStyle: 'medium' });

export const useSummaryLineLineAttributesText = (line: CheckoutLine | OrderLine) => {
  if (!line.variant || !line.variant.attributes) return '';

  const parsedValues = [];

  for (const { values } of line.variant.attributes) {
    for (const { name, dateTime, translation } of values) {
      if (translation?.name) {
        parsedValues.push(translation.name);
      } else if (dateTime) {
        parsedValues.push(formatter.format(new Date(dateTime as never)));
      }

      parsedValues.push(name);
    }
  }

  return parsedValues.join(', ');
};


export const PRODUCT_NAME_MAX_LENGTH = 60;
