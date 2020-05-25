import getUserId from "../utils/getUserId";

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
  meSeller(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);
    return prisma.query.seller(
      {
        where: {
          id: sellerId,
        },
      },
      info
    );
  },
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
          {
            seller: {
              name_contains: args.query,
            },
          },
        ],
      };
    }
    return prisma.query.products(opArgs, info);
  },
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
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        published: true,
      },
    };

    return prisma.query.reviews(opArgs, info);
  },
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
  myOrders(parent, args, { prisma, request }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    console.log(args);
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
  // TODO - finish this query
  myOrdersItems(parent, args, { prisma, request }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };
    console.log(args);
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

    return prisma.query.orders(opArgs, info)
  },
};

export default Query;
