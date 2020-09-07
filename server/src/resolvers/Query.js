import getUserId from "../utils/getUserId";
// from wesbos course
// forwardTo - https://courses.wesbos.com/account/access/5de58bb4c940036476995e89/view/289540060 from 24 minute
const { forwardTo } = require("prisma-binding");

const Query = {
  users(parent, args, { prisma }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    if (args.query) {
      opArgs.where = {
        OR: [{ name_contains: args.query }, { email_contains: args.query }],
      };
    }
    return prisma.query.users(opArgs, info);
  },
  meUser(parent, args, { prisma, request }, info) {
    // console.log(request)
    const userId = getUserId(request);
    return prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      info
    );
  },
  sellers(parent, args, { prisma }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    if (args.query) {
      opArgs.where = {
        OR: [{ name_contains: args.query }, { email_contains: args.query }],
      };
    }
    return prisma.query.sellers(opArgs, info);
  },
  // ??TODO: restrict access in future when seller has more information
  seller(parent, args, { prisma }, info) {
    // console.log(args);
    return prisma.query.seller({ where: { id: args.id } }, info);
  },
  meSeller(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);
    // console.log(sellerId);
    return prisma.query.seller(
      {
        where: {
          id: sellerId,
        },
      },
      info
    );
  },
  sellersConnection: forwardTo("prisma"),
  //   products: {
  //       fragment: "fragment reviewOnProduct on Review { published user { id } }",
  //       resolve(parent, args, { prisma }, info) {
  //         const opArgs = {};
  //         if (args.query) {
  //           opArgs.where = {
  //             OR: [
  //               { name_contains: args.query },
  //               { department_contains: args.query },
  //               {
  //                 seller: {
  //                   name_contains: args.query,
  //                 },
  //               },
  //             ],
  //             reviews_every: {
  //                 published: true
  //             }
  //           };
  //         }
  //         return prisma.query.products(opArgs, info);
  //       },
  //   },
  // TODO - show only products which count is more than 0
  products(parent, args, { prisma }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    if (args.query) {
      opArgs.where = {
        OR: [
          { name_contains: args.query },
          { department_contains: args.query },
          { description_contains: args.query },
          {
            seller: {
              name_contains: args.query,
            },
          },
        ],
      };
    }
    console.log(opArgs);
    return prisma.query.products(opArgs, info);
  },
  product: forwardTo("prisma"),
  productsConnection: forwardTo("prisma"),

  // TODO - make ALL my reviews visible or only published???
  //   reviews: {
  //     fragment: "fragment reviewInfo on Review { user { id } published } ",
  //     resolve(parent, args, { prisma, request }, info) {
  //       const opArgs = {
  //         where: {
  //           published: true,
  //         },
  //       };

  //       return prisma.query.reviews(opArgs, info);
  //     },
  //   },

  reviews(parent, args, { prisma }, info) {
    // console.log(args)
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        AND: [
          { published: true },
          {
            product: {
              id: args.id,
            },
          },
        ],
      },
    };

    return prisma.query.reviews(opArgs, info);
  },
  reviewsConnection: forwardTo("prisma"),
  myReviews(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        user: {
          id: userId,
        },
      },
    };

    return prisma.query.reviews(opArgs, info);
  },
  async myCurrentOrder(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const [orderFound] = await prisma.query.orders(
      {
        where: {
          AND: [{ user: { id: userId } }, { started: true, finished: false }],
        },
      },
      info
    );
    return orderFound;
  },
  myOrders(parent, args, { prisma, request }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    // console.log(args);
    const userId = getUserId(request);
    opArgs.where = {
      AND: [
        {
          user: {
            id: userId,
          },
        },
        {
          items_some: {
            product: {
              name_contains: args.query,
            },
          },
        },
      ],
    };

    return prisma.query.orders(opArgs, info);
  },
  async order(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    return prisma.query.order(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  // TODO - finish this query
  myOrderItems(parent, args, { prisma, request }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    // console.log(args);
    const userId = getUserId(request);
    opArgs.where = {
      AND: [
        {
          user: {
            id: userId,
          },
        },
        // {
        //   product: {
        //     name_contains: args.query,
        //   },
        // },
      ],
    };
    if (args.query) {
      opArgs.where.AND.push({
        product: {
          name_contains: args.query,
        },
      });
    }
    return prisma.query.orderItems(opArgs, info);
  },
  orderItemsConnection: forwardTo("prisma"),
  async orderItems(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        product: {
          AND: [
            {
              seller: {
                id: sellerId,
              },
            },
          ],
        },
      },
    };
    if (args.query) {
      const productExists = await prisma.exists.Product({
        id: args.query,
      });

      if (!productExists) {
        throw new Error("Product not found");
      }

      opArgs.where.product.AND.push({ id: args.query });
    }
    // console.log(JSON.stringify(opArgs, null, 2));
    return prisma.query.orderItems(opArgs, info);
  },
};

export default Query;
