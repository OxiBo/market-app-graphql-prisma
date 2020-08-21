import bcrypt, { hash } from "bcryptjs";
const { randomBytes } = require("crypto");
const { promisify } = require("util");
import getUserId from "../utils/getUserId";
import hashPassword from "../utils/hashPassword";
import generateJWTtoken from "../utils/generateJWTtoken";
const stripe = require("stripe")(process.env.STRIPE_KEY);
import calcProductRating from "../utils/calcProductRating";
import { transport, makeANiceEmail } from "../utils/mail";

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    // console.log(args.data)
    const email = args.data.email.toLowerCase();
    const password = await hashPassword(args.data.password);
    // console.log(password);
    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        email,
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
    const email = data.email.toLowerCase();
    const userExists = await prisma.query.user({
      where: {
        email,
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

    if (typeof args.data.email === "string") {
      args.data.email = args.data.email.toLowerCase();
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
    const email = args.data.email.toLowerCase();
    const password = await hashPassword(args.data.password);
    // console.log(password);
    const seller = await prisma.mutation.createSeller({
      data: {
        ...args.data,
        password,
        email,
      },
    });
    // console.log(user.id);
    return {
      seller,
      token: generateJWTtoken(seller.id),
    };
  },
  async loginSeller(parent, { data }, { prisma }, info) {
    const email = data.email.toLowerCase();
    const sellerExists = await prisma.query.seller({
      where: {
        email,
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
    if (typeof args.data.email === "string") {
      args.data.email = args.data.email.toLowerCase();
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
  async requestReset(parent, args, { prisma, request }, info) {
    // console.log(request.response);
    // check if the user/seller exists in the db
    let user;
    if (args.type === "BUYER") {
      user = await prisma.query.user({
        where: {
          email: args.email,
        },
      });
    }
    if (args.type === "SELLER") {
      user = await prisma.query.seller({
        where: {
          email: args.email,
        },
      });
    }

    if (!user) {
      throw new Error("No user found for provided email");
    }

    // generate reset token and update user/seller with the token and expiry reset token
    const randomBytesPromisified = promisify(randomBytes);

    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    const res =
      args.type === "BUYER"
        ? await prisma.mutation.updateUser({
            where: {
              email: args.email,
            },
            data: {
              resetToken,
              resetTokenExpiry,
            },
          })
        : await prisma.mutation.updateSeller({
            where: {
              email: args.email,
            },
            data: {
              resetToken,
              resetTokenExpiry,
            },
          });

    // console.log(res);
    // email them reset token, wrapping it in try{}catch is recommended for mail sending here
    // https://nodemailer.com/about/
    try {
      await transport.sendMail({
        from: "margooxi@ukr.net",
        to: user.email,
        subject: "Your Password Reset Token",
        html: makeANiceEmail(
          `Your Password Reset Token is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?type=${args.type}?resetToken=${resetToken}">Click here to reset!</a>`
        ),
      });
    } catch (error) {
      console.error(error);
    }

    return {
      message: "Your reset token has been emailed to provided email address",
    };
  },
  async resetPassword(parent, args, { prisma, request }, info) {
    // check if the user/seller with the provided reset token exists
    let user;
    if (args.type === "BUYER") {
      [user] = await prisma.query.users({
        where: {
          resetToken: args.resetToken,
          resetTokenExpiry_gte: Date.now() - 3600000,
        },
      }); // returns an array with one found user
    }
    if (args.type === "SELLER") {
      [user] = await prisma.query.sellers({
        where: {
          resetToken: args.resetToken,
          resetTokenExpiry_gte: Date.now() - 3600000,
        },
      }); // returns an array with one found user
    }

    if (!user) {
      throw new Error("This token is either invalid or expired");
    }

    // hash new password
    const password = await hashPassword(args.password);

    // generate JWT
    const token = generateJWTtoken(user.id);

    // save the new password to the user and remove old reset token fields

    let updatedUser;
    if (args.type === "BUYER") {
      updatedUser = await prisma.mutation.updateUser({
        where: { email: user.email },
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // return user with updated password
      //https://www.apollographql.com/docs/apollo-server/schema/unions-interfaces/
      return {
        __typename: "UserAuthPayLoad",
        user: updatedUser,
        token,
      };
    }

    if (args.type === "SELLER") {
      updatedUser = await prisma.mutation.updateSeller({
        where: { email: user.email },
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // return seller with updated password
      return {
        __typename: "SellerAuthPayLoad",
        seller: updatedUser,
        token,
      };
    }
  },
  async createProduct(parent, args, { prisma, request, response }, info) {
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

    // response.cookie("testCookie", "testing cookie in response", {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    // });

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

    // console.log(price)
    // const price = args.price * 100;

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
    // console.log(userExists)
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
      // console.log(sellerExists)
      if (args.data.stock && !userExists && !sellerExists) {
        // console.log("???")
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
  // async createOrder(parent, args, { prisma, request }, info) {
  //   const userId = getUserId(request);
  //   const foundUser = await prisma.exists.User({
  //     id: userId,
  //   });
  //   if (!foundUser) {
  //     throw new Error("You have to be logged in user to create an order");
  //   }

  //   // check if user does not have an open order(cart) already
  //   const orderExists = await prisma.query.orders(
  //     {
  //       where: {
  //         AND: [{ user: { id: userId } }, { started: true }],
  //       },
  //     },
  //     info
  //   );

  //   if (orderExists.length) {
  //     throw new Error("You have already created a new order");
  //   }

  //   return prisma.mutation.createOrder(
  //     {
  //       data: {
  //         started: true,
  //         user: {
  //           connect: [{
  //             id: userId,
  //           }],
  //         },
  //       },
  //     },
  //     info
  //   );
  // },
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
  async addToOrder(parent, args, { prisma, request }, info) {
    // check if the user is logged in
    const userId = getUserId(request);
    console.log(args);
    // find the product to get price and availability
    const [productAvailable] = await prisma.query.products(
      {
        where: {
          AND: [{ id: args.id }, { stock_gt: 0 }],
        },
      },
      `{ name description price image }`
    );
    // console.log("Is product available???");
    console.log(productAvailable);
    if (!productAvailable) {
      throw new Error("Product is not available");
    }

    // check if a new order has already been created
    const [orderExists] = await prisma.query.orders(
      {
        where: {
          AND: [{ user: { id: userId } }, { started: true, finished: false }],
        },
      },
      "{ id items {id count product { id name }}}"
    );

    let orderItemCreated;

    // const test = await prisma.query.orders(null, '{id items{id}}')
    // console.log(test)
    // if order(cart) was not created yet
    if (!orderExists) {
      const newOrder = await prisma.mutation.createOrder(
        {
          data: {
            started: true,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
        info
      );
      // console.log(productAvailable);
      orderItemCreated = await prisma.mutation.createOrderItem(
        {
          data: {
            ...productAvailable,
            user: {
              connect: {
                id: userId,
              },
            },
            product: {
              connect: { id: args.id },
            },
            order: {
              connect: { id: newOrder.id },
            },

            // count: args.count  - might use this in the future
            // price: productAvailable.price,
          },
        },
        info
      );
      // console.log(newOrder.items);
      // console.log(orderItemCreated);
      // const updatedOrder =
      await prisma.mutation.updateOrder(
        {
          where: {
            id: newOrder.id,
          },
          data: {
            items: {
              connect: [{ id: orderItemCreated.id }],
            },
          },
        },
        info
      );
      // console.log(updatedOrder);
      return orderItemCreated;
    }

    // if order(cart) already Exists

    // query the user's current order(=cart) ( check if that item(product) is already in their order(cart) and increment by 1 if it is)
    // console.log(orderExists);
    const orderItemExists = orderExists.items.find(
      (item) => item.product.id === args.id
    );

    if (orderItemExists) {
      console.log("This product is already in the user's cart");

      return prisma.mutation.updateOrderItem(
        {
          where: { id: orderItemExists.id },
          data: {
            count: orderItemExists.count + 1,
            // price: orderItemExists.price + productAvailable.price,
          },
        },
        info
      );
    }

    // if it's not in the cart and product stock is greater than 0, create a fresh cart item
    orderItemCreated = await prisma.mutation.createOrderItem(
      {
        data: {
          ...productAvailable,
          user: {
            connect: {
              id: userId,
            },
          },
          product: {
            connect: { id: args.id },
          },
          order: {
            connect: { id: orderExists.id },
          },
          //count: args.count  - ???
          // price: productAvailable.price,
        },
      },
      info
    );
    // console.log(orderItemCreated);
    return orderItemExists;

    // return orderItemCreated;
  },
  async removeItemFromOrder(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const itemExists = await prisma.exists.OrderItem(
      {
        id: args.id,
        user: {
          id: userId,
        },
      },
      info
    );

    if (!itemExists) {
      throw new Error("The item is not found or does not belong to your cart");
    }
    return prisma.mutation.deleteOrderItem(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async checkoutAndPay(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const [currentOrder] = await prisma.query.orders(
      {
        where: {
          AND: [
            {
              user: {
                id: userId,
              },
              started: true,
              finished: false,
            },
          ],
        },
      },
      info
    ); //    `{ id items { id count price name}}`

    const total = currentOrder.items.reduce((total, item) => {
      return total + item.price * item.count;
    }, 0);

    // console.log(total)
    // console.log(args.token)
    // console.log(currentOrder);

    // https://stripe.com/docs/api/charges/create
    const charge = await stripe.charges.create({
      amount: total,
      currency: "usd",
      source: args.token,
    });
    // console.log(charge)

    const finishedOrder = await prisma.mutation.updateOrder(
      {
        where: {
          id: currentOrder.id,
        },
        data: {
          total: charge.amount,
          charge: charge.id,
          finished: true,
          finishedAt: new Date()
        },
      },
      info
    );

    return finishedOrder;
  },
};

export default Mutation;

/* 


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

*/
