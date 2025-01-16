import type { RequestEvent } from "./$types";
import { z } from 'zod';


const CheckoutLineSchema = z.object({
  variantID: z
    .string()
    .trim()
    .min(1, { message: 'variant id is required' }),
  quantity: z
    .number()
    .int({ message: 'quantity must be an integer' })
    .min(1, { message: 'quantity must be at least 1' }),
})

export const POST = async (evt: RequestEvent) => {
  const data = await evt.request.json();

  const result = await CheckoutLineSchema.parseAsync(data);

  console.log(result);
};
