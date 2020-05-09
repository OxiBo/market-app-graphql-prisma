import getUserId from "../utils/getUserId";

const Review = {
  //   published: {
  //     fragment: "fragment userId on Review { id }",
  //     resolve(parent, args, { prisma, request }, info) {
  //       const userId = getUserId(request, false);

  //       if (userId && parent.user.id === userId) {
  //         return parent.published;
  //       } else {
  //         return parent.published ?
  //       }
  //     },
  //   },
  published: {
    // fragment: `fragment userId on Review { id user { id }}`,
    fragment: `fragment userId on Review {   user { id }  }`,
    resolve(parent, args, { prisma, request }, info) {
    //   console.log(JSON.stringify(parent, null, 3));
      //   const userId = getUserId(request);
    //   console.log(parent);
      return parent.published;
    },
  },

};

export default Review;
