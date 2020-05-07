import { extractFragmentReplacements } from "prisma-binding";

import Query from "./Query";

import Mutation from "./Mutation";
import User from "./User";
import Seller from "./Seller";
import Product from "./Product";

const resolvers = {
  Query,
  Mutation,
  User, 
  Seller,
  Product
};
const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
