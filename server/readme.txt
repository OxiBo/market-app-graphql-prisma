# Market App Server

## Overview

The Market App Server is the backend component of the Market App project, designed to handle the business logic and data management for an e-commerce platform. It allows users to upload images, save a shopping cart, write product reviews, and keep track of orders and reviews. The server is built using Node.js, GraphQL, Prisma, GraphQL Yoga, Stripe, and JWT.

## Technologies

- **Backend**: Node.js, GraphQL Yoga, Prisma, Stripe, JWT
- **Database**: Prisma
- **Authentication**: JWT
- **Email**: Nodemailer

## Features

- User authentication and authorization
- Product listing and search
- Image upload for products
- Shopping cart functionality
- Product reviews and ratings
- Order tracking
- Stripe integration for payments

## Prerequisites

- Node.js (v12 or later)
- npm (v6 or later)
- Prisma CLI

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/OxiBo/market-app-graphql-prisma.git
   cd market-app-graphql-prisma

2. **Install dependencies:**

    ```sh
    npm install 
    ```
3. **Set up environment variables:**

Create a `.env` file in the root directory and add the necessary environment variables.

4. **Start the server:**
   ```sh
     npm start 
    ```

## API Endpoints

- **GraphQL Endpoint**: `/graphql`
- **Playground**: `/playground`


## Client Repository

For the client-side code, please check out the repository: [Market Place Client](https://github.com/OxiBo/market-place-client)
