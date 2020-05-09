import getUserId from "../utils/getUserId";

const Seller = {
  email: {
    fragment: "fragment sellerId on Seller { id }",
    resolve(parent, args, { prisma, request }, info) {
      const sellerId = getUserId(request, false);
    //  console.log(JSON.stringify(parent, 2))
      if (sellerId) {
        return parent.email;
      } else {
        return null;
      }
    },
  },
};

export default Seller;
