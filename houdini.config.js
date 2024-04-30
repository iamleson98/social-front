/** @type {import('houdini').ConfigFile} */
const config = {
  plugins: {
    "houdini-svelte": {},
  },
  schemaPath: "src/graphql/schema.graphql",
  watchSchema: {
    url: (env) => env.GRAPHQL_API_END_POINT,
    
  },
};

export default config;