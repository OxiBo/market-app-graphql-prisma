import userId from "../utils/getUserId";
import getUserId from "../utils/getUserId";

const Subscription = {
  product: {
    subscribe(parent, args, { prisma }, info) {
      return prisma.subscription.product(
        {
          where: {
            node: {
              stock_gt: 0,
            },
          },
        },
        info
      );
    },
  },
  review: {
    subscribe(parent, args, { prisma }, info) {
      return prisma.subscription.review(
        {
          where: {
            node: {
              published: true,
            },
          },
        },
        info
      );
    },
  },
  orderItem: {
    async subscribe(parent, args, { prisma, request }, info) {
      const id = getUserId(request);
      const userExists = await prisma.exists.User({
        id,
      });
    //   console.log("user " + userExists)
      const sellerExists = await prisma.exists.Seller({
        id,
      });
    //   console.log("seller " + sellerExists)
      if (!userExists && !sellerExists) {
        throw new Error("You have to be logged in to see order items");
      }

      const opArgs = {};
      if (userExists) {
        opArgs.where = {
          node: {
            user: {
              id,
            },
          },
        };
      }
      if (sellerExists) {
        opArgs.where = {
          node: {
            product: {
              seller: {
                id,
              },
            },
          },
        };
      }

      return prisma.subscription.orderItem(opArgs, info);
    },
  },
};

export default Subscription;
