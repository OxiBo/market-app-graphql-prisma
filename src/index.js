require("dotenv").config();
import "@babel/polyfill/noConflict"; // installed for future deployment
import server from "./createServer";




// console.log(process.env);
const options = {
  port: process.env.PORT || 7070,
};

server.start(options, ({ port }) => {
  console.log(`App is running on port ${port}`);
});
