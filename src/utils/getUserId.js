require("dotenv").config();

import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
//   console.log(request.request.headers)
  const header = request.request.headers.authorization;
  if (header) {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  }
  //   console.log(token)
  if (requireAuth) {
    throw new Error("Authentication required");
  }
  return null;
};

export default getUserId;
