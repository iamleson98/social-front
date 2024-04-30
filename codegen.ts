import type { CodegenConfig } from '@graphql-codegen/cli'
 
const config: CodegenConfig = {
  schema: import.meta.env.VITE_GRAPHQL_API_END_POINT,
  documents: './src/graphql/**/*.graphql',
  generates: {
    './src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node', '@kitql/graphql-codegen'],
    },
  },
}
export default config
