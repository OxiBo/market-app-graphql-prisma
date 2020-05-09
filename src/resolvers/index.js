import { extractFragmentReplacements } from "prisma-binding";

import Query from "./Query";

import Mutation from "./Mutation";
import User from "./User";
import Seller from "./Seller";
import Product from "./Product";
import Review from "./Review";

const resolvers = {
  Query,
  Mutation,
  User, 
  Seller,
  Product,
  Review
};
const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
