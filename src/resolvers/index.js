import { extractFragmentReplacements } from "prisma-binding";

import Query from "./Query";

import Mutation from "./Mutation";
import Subscription from "./Subscription";
import User from "./User";
import Seller from "./Seller";
import Product from "./Product";
import Review from "./Review";
import Order from "./Order";

const resolvers = {
  Query,
  Mutation,
  // Subscription,
  User, 
  Seller,
  Product,
  Review, Order
};
const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
