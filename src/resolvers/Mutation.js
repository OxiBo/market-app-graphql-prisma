import bcrypt from "bcryptjs";

import getUserId from "../utils/getUserId";
import hashPassword from "../utils/hashPassword";
import generateJWTtoken from "../utils/generateJWTtoken";
import calcProductRating from "../utils/calcProductRating";

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
      throw new Error("Seller not found");
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
      throw new Error("You have a product with the same name already");
    }
    return prisma.mutation.createProduct(
      {
        data: {
          ...args.data,
          // rating: 0,
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
    const productExists = await prisma.exists.Product({
      id: args.id,

      //   seller: {
      //     id: sellerId,
      //   },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }
    // TODO - change stock count when create Order
    const userId = getUserId(request);
    console.log(userExists)
    // check if the user is a buyer
    const userExists = await prisma.exists.User({
      id: userId,
    });
    if (args.data.rating) {
      // const userId = getUserId(request);
      // const userExists = await prisma.exists.User({
      //   id: userId,
      // });
      if (!userExists) {
        throw new Error("You have to be logged in User to do that");
      }
    } else if (userExists && args.data.stock) {


    } else {
      
      const sellerId = getUserId(request);
      const sellerExists = await prisma.exists.Seller({
        id: sellerId,
      });
      console.log(sellerExists)
      if (args.data.stock && (!userExists && !sellerExists)) {
        console.log("???")
        throw new Error("You cannot update the product stock count");
      }
      if (!sellerExists) {
        throw new Error("You have to be a seller to update the product");
      }
    }

    if (args.data.stock && args.data.stock < 0) {
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
  //   updateProductRating(parent, args, { prisma, request }, info) {
  //     return prisma.mutation.updateProductRating(
  //       {
  //         where: {
  //           product: args.id,
  //         },
  //         rating: args.rating,
  //       },
  //       info
  //     );
  //   },
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

  async createReview(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const foundUser = await prisma.exists.User({
      id: userId,
    });
    if (!foundUser) {
      throw new Error("You have to be logged in user to write a review");
    }

    const allProductReviews = await prisma.query.reviews({
      where: {
        published: true,
        product: {
          id: args.data.product,
        },
      },
    });

    await calcProductRating(
      allProductReviews,
      args.data.product,
      args.data.rating,
      info,
      1
    );

    // TODO - make sure user have the product among products they purchased
    return prisma.mutation.createReview(
      {
        data: {
          ...args.data,
          product: {
            connect: {
              id: args.data.product,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
      info
    );
  },
  async updateReview(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const foundReview = await prisma.exists.Review({
      id: args.id,
      user: {
        id: userId,
      },
    });
    if (!foundReview) {
      throw new Error("Review not found");
    }

    if (args.data.rating || args.data.published === false) {
      const productReview = await prisma.query.review(
        {
          where: {
            id: args.id,
          },
        },
        "{ product { id }}"
      );

      const allReviewsWithoutUpdated = await prisma.query.reviews({
        where: {
          AND: [
            {
              product: {
                id: productReview.product.id,
              },
            },
            { published: true },
            { id_not: args.id },
          ],
        },
      });

      calcProductRating(
        allReviewsWithoutUpdated,
        productReview.product.id,
        args.data.rating,
        info,
        1
      );
    }

    return prisma.mutation.updateReview(
      {
        where: {
          id: args.id,
        },
        data: args.data,
      },
      info,
      0
    );
  },
  async deleteReview(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const foundReview = await prisma.exists.Review({
      id: args.id,
      user: {
        id: userId,
      },
    });
    if (!foundReview) {
      throw new Error("Review not found");
    }

    const productReview = await prisma.query.review(
      {
        where: {
          id: args.id,
        },
      },
      "{ product { id }}"
    );

    const allReviewsWithoutDeleted = await prisma.query.reviews({
      where: {
        AND: [
          {
            product: {
              id: productReview.product.id,
            },
          },
          { published: true },
          { id_not: args.id },
        ],
      },
    });

    calcProductRating(
      allReviewsWithoutDeleted.length === 0 ? false : allReviewsWithoutDeleted,
      productReview.product.id,
      0,
      info,
      0
    );

    return prisma.mutation.deleteReview(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },

  // async createOrderItem(parent, args, { prisma, request }, info) {
  //   const userId = getUserId(request);


  //   const isProductAvailable = await prisma.query.products(
  //     {
  //       where: {
  //         AND: [{ id: args.data.product }, { stock_gte: args.data.count }],
  //       },
  //     },
  //     "{ id stock price }"
  //   );
  //   console.log(JSON.stringify(args, null, 3))

  //   console.log(isProductAvailable)

  //   // TODO - if one of the products unavailable this condition will stop the mutation all together. This needs to be changed
  //   if (!isProductAvailable.length) {
  //     throw new Error(
  //       `Product with id ${args.data.product} or the amount of the items is not available`
  //     ); // TODO -  this needs to be changed
  //   }


  //   return prisma.mutation.createOrderItem(
  //     {
  //       data: {
  //         count: args.data.count,
  //         price: isProductAvailable[0].price,// ?????
  //         product: {
  //           connect: {
  //             id: args.product,
  //           },
  //         },
  //         user: {
  //           connect: {
  //             id: userId,
  //           },
  //         },
  //       },
  //     },
  //     info
  //   );
  // },
  async createOrder(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const foundUser = await prisma.exists.User({
      id: userId,
    });
    if (!foundUser) {
      throw new Error("You have to be logged in user to make an order");
    }
    let total = 0;

    // console.log(JSON.stringify(args, null, 3));
    // using reduce with promises -  https://stackoverflow.com/questions/41243468/javascript-array-reduce-with-async-await   and about reduce() again https://www.freecodecamp.org/forum/t/how-to-use-javascript-array-prototype-reduce-reduce-conceptual-boilerplate-for-problems-on-arrays/14687

    const products = await args.data[0].items.reduce(async (acc, item) => {
      const accumulator = await acc;
      const productAvailable = await prisma.query.products(
        {
          where: {
            AND: [{ id: item.product }, { stock_gte: item.count }],
          },
        },
        "{ id stock price }"
      );

      // TODO - if one of the products unavailable this condition will stop the mutation all together. This needs to be changed
      if (!productAvailable.length) {
        throw new Error(
          `Product with id ${item.product} or the amount of the products is not available`
        ); // TODO -  this needs to be changed
      }

      if (productAvailable) {
        const itemCreated = await prisma.mutation.createOrderItem(
          {
            data: {
              count: item.count,
              price: productAvailable[0].price,
              product: {
                connect: {
                  id: item.product,
                },
              },
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          },
          "{ id }"
        );
        total += productAvailable[0].price * item.count;
        accumulator.push({ id: itemCreated.id });
        return Promise.resolve(accumulator);
      }
    }, Promise.resolve([]));
    // console.log(products);
    // return {};
    return prisma.mutation.createOrder(
      {
        data: {
          total,
          items: {
            connect: products,
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
      info
    );
  },
  async deleteOrder(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const foundOrder = await prisma.exists.Order({
      id: args.id,
      user: {
        id: userId,
      },
    });
    if (!foundOrder) {
      throw new Error("Order not found");
    }

    return prisma.mutation.deleteOrder(
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
