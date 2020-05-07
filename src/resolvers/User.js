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
};

export default User;
