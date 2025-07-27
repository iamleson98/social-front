export type FieldName = 'price' | 'minimumOrderPrice' | 'maximumOrderPrice';

/**
 * type returned by zod
 */
export type ZodErrors = { message: string; path: [number, FieldName] }[];

export type PriceErrors = Record<number, Record<FieldName, string>>;

export const calculateZodErrors = (errs: ZodErrors): PriceErrors => {
  const result: PriceErrors = {};
  for (const err of errs) {
    if (!result[err.path[0]]) result[err.path[0] as number] = {} as Record<FieldName, string>;
    result[err.path[0]][err.path[1] as FieldName] = err.message;
  }

  return result;
};
