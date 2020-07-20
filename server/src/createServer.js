import { GraphQLServer } from "graphql-yoga";
import prisma from "./prisma";
import { resolvers, fragmentReplacements } from "./resolvers";
export default new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  },
  context: (request) => {
    return {
      prisma, 
      request
    };
  },
  fragmentReplacements,
});
