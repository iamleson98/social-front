import { readFileSync } from 'node:fs';

// const dirName = process.cwd();

const data = readFileSync(`src/lib/graphql/schema.graphql`);

export const typeDefs = data.toString();
