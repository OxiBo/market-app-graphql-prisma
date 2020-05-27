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
      subscribe(parent, args, {prisma }, info){
          return prisma.subscription.review({
              where: {
                  node: {
                      published: true
                  }
              }
          }, info)
      }
  }
};

export default Subscription;
