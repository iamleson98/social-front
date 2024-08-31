import { readFileSync } from 'node:fs';

const dirName = process.cwd();

const data = readFileSync(`${dirName}/src/graphql/schema.graphql`);

export const typeDefs = data.toString();
