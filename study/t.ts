import z, { array, object, string, flattenError, number, treeifyError } from "zod"

const Schema = array(string().nonempty("required").nonoptional('plase'));

type T = z.infer<typeof Schema>;

// const ms: T = ['', 'em', null]

const result = Schema.safeParse(['', 'em']);

if (!result.success) {
  const value = flattenError(result.error);
  console.log(value)
}

// const PriceSchema = array(
//   object({
//     price: number().nonnegative('negative'),
//     minimumOrderPrice: number().nonnegative('required'),
//     maximumOrderPrice: number().nonnegative('required'),
//   }).refine((item) => item.minimumOrderPrice <= item.maximumOrderPrice, {
//     message: 'min price >= max price',
//     path: ['minimumOrderPrice'],
//   }),
// );

// type T = z.infer<typeof PriceSchema>;

// const v: T = [{
//   price: -1,
//   minimumOrderPrice: 10,
//   maximumOrderPrice: 0
// }, {
//   price: -1,
//   minimumOrderPrice: 10,
//   maximumOrderPrice: 0
// }]

// const result = PriceSchema.safeParse(v)

// if (!result.success) {
//   const vl = result.error.issues;
//   console.log(vl)
// }
