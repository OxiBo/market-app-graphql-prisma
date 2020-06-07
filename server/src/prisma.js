require("dotenv").config();
import { Prisma } from 'prisma-binding'
import { fragmentReplacements } from "./resolvers/index";

// console.log(process.env.PRISMA_ENDPOINT)
// console.log(process.env.SECRET)

const prisma = new Prisma({
    typeDefs: "src/generated/prisma.graphql" ,
    // endpoint:   "http://localhost:4466/market/default",
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
    fragmentReplacements
})

export default prisma