import { read } from '$app/server';
import schemaFile from '$lib/graphql/schema.graphql';


const file = read(schemaFile);

export const typeDefs = await file.text();
