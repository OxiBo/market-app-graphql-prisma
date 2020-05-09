import getUserId from "../utils/getUserId";

const Query = {
  users(parent, args, { prisma }, info) {
    const opArgs = {};
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
    const opArgs = {};
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
  products(parent, args, { prisma }, info) {
    const opArgs = {};
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
  reviews(parent, args, { prisma, request }, info) {
   
    const opArgs = {
      where: {
        published: true,
      },
    };
    

    return prisma.query.reviews(opArgs, info);
  },
};

export default Query;
