import getUserId from "../utils/getUserId";

const Product = {
  count: {
    fragment: "fragment sellerId on Product {  seller { id }  }",
   
    resolve(parent, args, { prisma, request }, info) {
      const sellerId = getUserId(request, false); // authentication is not required if false is passed

      if (sellerId === parent.seller.id) {
        return parent.count;
      } else {
        return parent.count > 0 ? true : false;
      }

        // return parent.count;
    },
  },

  
  reviews: {
    // fragment: `fragment userId on Review { id user { id }}`,
    // fragment: `fragment userId on Product {  reviews { user { id }}  }`,
    resolve(parent, args, { prisma, request }, info) {
      console.log(JSON.stringify(parent, null, 3));
      const userId = getUserId(request);

      return parent.reviews;
    },
  },

  //   : {
  //     fragment: "fragment userId on Product { reviews { user { id } } }",
  //     resolve(parent, args, { prisma, request }, info) {
  //       const userId = getUserId(request, false); // authentication is not required if false is passed
  //       console.log(parent);
  //     },
  //   },
};

export default Product;
