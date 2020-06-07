import bcrypt from "bcryptjs";

const hashPassword = (password) => {
  if (password.length < 8 || password.length > 20) {
    throw new Error(
      "Password must be longer than 7 and not more than 20 characters"
    );
  }
  // console.log(password)
  return bcrypt.hash(password, 10);
};

export { hashPassword as default };
