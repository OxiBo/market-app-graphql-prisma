const Query = {
  users(parent, args, { prisma }, info) {
     
    return prisma.query.users(null, info)
  },
  sellers(parent, args, { prisma }, info) {
    return prisma.query.sellers(null, info)
  },
  products(parent, args, { prisma }, info){
      return prisma.query.products(null, info)
  }
};

export default Query;
