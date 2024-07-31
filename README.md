# Social Network Backend

This project is a backend API for a social networking application built with NestJS and MikroORM.

## Features

- User authentication with JWT
- User profile management
- Friend requests and friend management
- User search functionality

## Tech Stack

- [NestJS]
- [MikroORM]
- [PostgreSQL]
- [Jest]

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/your-username/social-network-backend.git
   cd social-network-backend
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.local.env` file in the root directory and add the following:

   ```
   HTTP_PORT=your-port
   POSTGRES_HOST=your-host
   POSTGRES_PORT=5432
   POSTGRES_USER=your-user
   POSTGRES_DB=your-db-name
   POSTGRES_PASSWORD=your-password
   JWT_SECRET=your-jwt-secret
   ```

4. Run database migrations:

   ```
   npx mikro-orm schema:update --run
   ```

5. Start the development server:
   ```
   pnpm start
   ```

The server should now be running on `http://localhost:HTTP_PORT`.

## Running Tests

To run the test suite:

```
pnpm test
```
