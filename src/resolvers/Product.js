import getUserId from "../utils/getUserId";

const Product = {
  count: {
    fragment: "fragment sellerId on Product { seller { id } }",
    resolve(parent, args, { prisma, request }, info) {
      const sellerId = getUserId(request, false); // authentication is not required if false is passed

      if (sellerId === parent.seller.id) {
        return parent.count;
      } else {
        return parent.count > 0 ? true : false;
      }
    },
  },
};

export default Product;
