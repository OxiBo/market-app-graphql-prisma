import getUserId from "../utils/getUserId";

const User = {
  email: {
    fragment: "fragment userId on User { id }",
    resolve(parent, args, { prisma, request }, info) {
      const userId = getUserId(request, false);
      // TODO - make email visible for seller who sold products to the user
      if (userId && userId === parent.id) {
        return parent.email;
      } else {
        null;
      }
    },
  },
  reviews: {
    fragment: "fragment userId on User { id }",
    resolve(parent, args, { prisma, request }, info) {
        // console.log(JSON.stringify(parent, null, 3))
      const opArgs = {
        where: {
          published: true,
          user: {
            id: parent.id,
          },
        },
      };
      const userId = getUserId(request, false);
      if (userId && userId === parent.id) {
        opArgs.where = {};
      }
      return prisma.query.reviews(opArgs, info);
    },
  },
  
};

export default User;
