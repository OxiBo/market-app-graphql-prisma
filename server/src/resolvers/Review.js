import getUserId from "../utils/getUserId";

const Review = {
//   user: {
//     fragment: "fragment published on Review { published }",
//     resolve(parent, args, { prisma, request }, info) {
//       return parent.user;
//     },
//   },
// text: {
//     fragment: "fragment reviewInfo on Review { published }",
//     resolve(parent, args, { prisma, request }, info) {
//         return parent.text;
//       },
// },

rating: {
    fragment: "fragment published on Review { published user { id }} ", // this ensures that review author id and published value will always be fetched when querying products (the fields rating will be always fetch to calculate overall product rating) <---- TODO
    resolve(parent, args, ctx, info){
        return parent.rating
    }
}



//   published: {
//     // fragment: `fragment userId on Review { id user { id }}`,
//     fragment: `fragment userId on Review {   user { id }  }`,
//     resolve(parent, args, { prisma, request }, info) {
//       //   console.log(JSON.stringify(parent, null, 3));
//       //   const userId = getUserId(request);
//       //   console.log(parent);
//       return parent.published;
//     },
//   },
};

export default Review;
