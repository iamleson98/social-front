import { type CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: './src/lib/graphql/*.graphql',
  // schema: 'https://sitename.saleor.cloud/graphql/',
  // documents: './src/**/*.gql',
  generates: {
    './src/lib/gql/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
}

export default config
