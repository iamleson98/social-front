import { read } from '$app/server';
// @ts-expect-error - This is a valid import
import schemaFile from '$lib/graphql/schema.graphql'; 


const file = read(schemaFile);

export const typeDefs = await file.text();
