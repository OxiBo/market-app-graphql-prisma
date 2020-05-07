import getUserId from "../utils/getUserId";

const Seller = {
  email: {
    fragment: "fragment sellerId on Seller { id }",
    resolve(parent, args, { prisma, request }, info) {
      const sellerId = getUserId(request, false);
     
      if (sellerId) {
        return parent.email;
      } else {
        null;
      }
    },
  },
};

export default Seller;
