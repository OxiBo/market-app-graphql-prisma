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
    return prisma.mutation.createProduct({
      data: {
        ...args.data,
        seller: {
          connect: {
            id: sellerId,
          },
        },
      },
    });
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
};

export default Mutation;
