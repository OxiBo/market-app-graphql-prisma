import prisma from "../prisma";

const calcProductRating = async (reviewList, productId, newRate, info, add) => {
    
  let rating = 0;
  if (reviewList) {
    rating = reviewList.reduce((acc, item) => {
      return acc + item.rating;
    }, 0);

    rating = Number(
            Math.round((rating + newRate) / (reviewList.length + add) + "e2") +
              "e-2"
          ); // https://www.jacklmoore.com/notes/rounding-in-javascript/
  }

  // TODO - refactor it to call this mutation in Review mutations ???
  await prisma.mutation.updateProduct(
    {
      where: {
        id: productId,
      },
      data: {
        rating
      },
    },
    info
  );
};

export default calcProductRating;
