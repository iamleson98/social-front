import { readFile } from 'fs/promises';

const schemaFile = 'src/lib/graphql/schema.graphql';

let typeDefs: string;
try {
  typeDefs = await readFile(schemaFile, 'utf-8');
} catch (err) {
  console.error(err);
}

export { typeDefs };
