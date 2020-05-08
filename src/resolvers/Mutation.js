import bcrypt from "bcryptjs";

import getUserId from "../utils/getUserId";
import hashPassword from "../utils/hashPassword";
import generateJWTtoken from "../utils/generateJWTtoken";

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    // console.log(args.data)

    const password = await hashPassword(args.data.password);
    // console.log(password);
    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password,
      },
    });
    // console.log(user.id);
    return {
      user,
      token: generateJWTtoken(user.id),
    };
  },

  async loginUser(parent, { data }, { prisma }, info) {
    const userExists = await prisma.query.user({
      where: {
        email: data.email,
      },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      data.password,
      userExists.password
    );

    if (!isPasswordMatch) {
      throw new Error("Unable to log in: wrong email or password");
    }
    return {
      user: userExists,
      token: generateJWTtoken(userExists.id),
    };
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const user = await prisma.exists.User({ id: userId });
    if (!user) {
      throw new Error(
        "You have to be a logged-in buyer to update your profile"
      );
    }

    if (typeof args.data.password === "string") {
      args.data.password = await hashPassword(args.data.password);
    }

    return prisma.mutation.updateUser(
      {
        where: {
          id: userId,
        },
        data: {
          ...args.data,
        },
      },
      info
    );
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const foundUser = await prisma.exists.User({
      id: userId,
    });
    if (!foundUser) {
      throw new Error("User not found");
    }

    return prisma.mutation.deleteUser(
      {
        where: {
          id: userId,
        },
      },
      info
    );
  },
  async createSeller(parent, args, { prisma }, info) {
    // console.log(args.data)

    const password = await hashPassword(args.data.password);
    // console.log(password);
    const seller = await prisma.mutation.createSeller({
      data: {
        ...args.data,
        password,
      },
    });
    // console.log(user.id);
    return {
      seller,
      token: generateJWTtoken(seller.id),
    };
  },
  async loginSeller(parent, { data }, { prisma }, info) {
    const sellerExists = await prisma.query.seller({
      where: {
        email: data.email,
      },
    });

    if (!sellerExists) {
      throw new Error("User not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      data.password,
      sellerExists.password
    );

    if (!isPasswordMatch) {
      throw new Error("Unable to log in: wrong email or password");
    }
    return {
      seller: sellerExists,
      token: generateJWTtoken(sellerExists.id),
    };
  },
  async updateSeller(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);

    const seller = await prisma.exists.Seller({ id: sellerId });
    if (!seller) {
      throw new Error(
        "You have to be a logged-in seller to update your profile"
      );
    }

    if (typeof args.data.password === "string") {
      args.data.password = await hashPassword(args.data.password);
    }

    return prisma.mutation.updateSeller(
      {
        where: {
          id: sellerId,
        },
        data: {
          ...args.data,
        },
      },
      info
    );
  },
  async deleteSeller(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);
    const foundSeller = await prisma.exists.Seller({
      id: sellerId,
    });
    if (!foundSeller) {
      throw new Error("Seller not found");
    }

    return prisma.mutation.deleteSeller(
      {
        where: {
          id: sellerId,
        },
      },
      info
    );
  },
  async createProduct(parent, args, { prisma, request }, info) {
    //   console.log(request.request.headers)
    const sellerId = getUserId(request);
    const seller = await prisma.query.seller({
      where: {
        id: sellerId,
      },
    });
    if (!seller) {
      throw new Error("You have to be a seller to create a new product");
    }

    const isUniqueName = await prisma.query.products({
      where: {
        AND: [
          {
            name: args.data.name,
          },
          {
            seller: {
              id: sellerId,
            },
          },
        ],
      },
    });

    if (isUniqueName.length) {
      throw new Error("You have a product with this name already");
    }
    return prisma.mutation.createProduct(
      {
        data: {
          ...args.data,
          seller: {
            connect: {
              id: sellerId,
            },
          },
        },
      },
      info
    );
  },
  async updateProduct(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);
    const sellerExists = await prisma.exists.Seller({
      id: sellerId,
    });
    if (!sellerExists) {
      throw new Error("You have to be a seller to update the product");
    }
    const productExists = await prisma.exists.Product({
      id: args.id,

      seller: {
        id: sellerId,
      },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    if (args.data.count < 0) {
      throw new Error("Product count has to be 0 or more");
    }
    return prisma.mutation.updateProduct(
      {
        where: {
          id: args.id,
        },
        data: {
          ...args.data,
        },
      },
      info
    );
  },
  async deleteProduct(parent, args, { prisma, request }, info) {
    const sellerId = getUserId(request);
    const sellerExists = await prisma.exists.Seller({
      id: sellerId,
    });
    if (!sellerExists) {
      throw new Error("You have to be a seller to delete the product");
    }

    const productExists = await prisma.exists.Product({
      id: args.id,
      seller: {
        id: sellerId,
      },
    });

    if (!productExists) {
      throw new Error(
        "Unable to delete the product. Product not found in your product list"
      );
    }
    return prisma.mutation.deleteProduct(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default Mutation;
