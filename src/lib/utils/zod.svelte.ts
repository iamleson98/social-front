import { writable } from "svelte/store";
import z, { type ZodObject, type ZodRawShape, flattenError } from "zod";

/** Util function that handle and convert
 * 
 * @example
 * ```typescript
 * import { createSchemaHandler } from './schema-handler';
 * import { z } from 'zod';
 * import { onMount } from 'svelte';
 *
 * // Define a simple Zod schema
 * const userSchema = z.object({
 *   name: z.string().min(2, 'Name must be at least 2 characters'),
 *   email: z.string().email('Invalid email address'),
 *   age: z.number().min(18, 'Must be at least 18 years old')
 * });
 *
 * // In a Svelte component
 * let formData = $state({ name: '', email: '', age: 0 });
 * 
 * const Validator = createSchemaHandler(userSchema, () => formData);
 * 
 * $inspect($Validator?.name);
 * 
 * formData.name = 'another';
 * 
 * Validator.validate();
 * ```
  */
export const createSchemaHandler = <T extends ZodRawShape>(schema: ZodObject<T>, valueGetter: () => object) => {
  type SchemaType = z.infer<typeof schema>;
  type Error = Partial<Record<keyof SchemaType, string[]>>;

  let { subscribe, set } = writable<Error>({});

  const validate = () => {
    const result = schema.safeParse(valueGetter());
    if (!result.success) {
      set(flattenError(result.error).fieldErrors);
    } else set({});

    return result.success;
  };

  return {
    validate,
    subscribe,
  };
};
