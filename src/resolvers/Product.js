import getUserId from "../utils/getUserId";
/* TODO - find out why fragment "fragment reviewInfo on Review { published user { id } }" does not work in Products.reviews resolver but works in playground
 */

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
//   rating(parent, args, { prisma }, info) {
//     if (parent.reviews && parent.reviews.length) {
//       let reviewsNumber = 0;
//       return (
//         parent.reviews
//           .filter((review) => review.published)
//           .reduce((acc, item) => {
//             reviewsNumber++;
//             return acc + item.rating;
//           }, 0) / reviewsNumber
//       );
//     }
//     return 0;
//   },
  reviews(parent, args, { prisma, request }, info) {
    //   console.log(JSON.stringify(parent.reviews, null, 3));
    const userId = getUserId(request, false);

    return parent.reviews.filter((review) => {
      if (userId && userId === review.user.id) {
        //   console.log(review);
        return review;
      } else {
        return review.published ? review : false;
      }
    });
  },
};

export default Product;
