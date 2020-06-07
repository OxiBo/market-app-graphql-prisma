require("dotenv").config();

import jwt from 'jsonwebtoken';



const generateJWTtoken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7 days" })
    
}

export default generateJWTtoken