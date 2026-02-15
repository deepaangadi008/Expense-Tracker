# Smart Expense Tracker - Backend

This directory contains the Node.js/Express backend for the Smart Expense Tracker application.

## Setup instructions

1. **Install dependencies**
   ```sh
   cd expense-tracker/server
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` and provide valid values (MongoDB connection string, JWT secret).
   - Example:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/expense_tracker
     JWT_SECRET=your_secret_key
     ```

3. **Run the server**
   - Development mode (with nodemon):
     ```sh
     npm run dev
     ```
   - Production mode:
     ```sh
     npm start
     ```

4. **Test API with Postman or curl**
   - Register:
     `POST http://localhost:5000/api/auth/register` with JSON body `{ "name":"Test","email":"test@example.com","password":"123456" }`.
   - Login:
     `POST http://localhost:5000/api/auth/login` returns token.
   - Use the returned `Bearer <token>` header to call protected endpoints:
     - `POST /api/transactions` to add transaction.
     - `GET /api/transactions` to fetch.
     - `DELETE /api/transactions/:id` to remove.
     - `GET /api/transactions/summary` for totals.

## Architecture

- `config/` – database connection.
- `models/` – Mongoose schemas (User, Transaction).
- `controllers/` – business logic separated from routes.
- `routes/` – Express route definitions.
- `middleware/` – auth middleware verifying JWT.

## Notes

- Passwords are hashed with bcrypt.
- JWT tokens expire in 30 days.
- Mongoose handles timestamp fields automatically.
