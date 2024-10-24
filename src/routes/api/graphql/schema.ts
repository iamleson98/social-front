// import { read } from '$app/server';


import { readFile } from 'fs/promises';

const schemaFile = 'src/lib/graphql/schema.graphql'; 

let typeDefs: string;

if (typeof Bun !== 'undefined') {
  const file = Bun.file(schemaFile);
  typeDefs = await file.text();
} else {
  typeDefs = await readFile(schemaFile, 'utf-8');
}

// export const typeDefs = await file.text();

export {typeDefs};
