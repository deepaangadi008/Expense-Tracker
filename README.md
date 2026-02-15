# Smart Expense Tracker - mer Stack

A full-stack expense tracking application using MongoDB, Express, React, and Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB running locally or Atlas connection

### Backend Setup
```sh
cd expense-tracker/server
npm install
cp .env.example .env
# edit .env with your MongoDB URI and JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend Setup
```sh
cd expense-tracker/client
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## 📁 Project Structure

```
expense-tracker/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hashing
│   │   └── Transaction.js        # Transaction schema
│   ├── controllers/
│   │   ├── authController.js     # Register/Login logic
│   │   └── transactionController.js  # Transaction CRUD
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── transactionRoutes.js  # Transaction endpoints
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── package.json
│   ├── .env.example
│   ├── server.js                 # Express app entry
│   └── README.md
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── SummaryCard.jsx
    │   │   ├── TransactionForm.jsx
    │   │   ├── TransactionList.jsx
    │   │   └── ChartSection.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    ├── package.json
    └── README.md
```

## 🔑 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- bcrypt (password hashing)
- JWT (authentication)

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (charts)
- Axios (HTTP client)
- React Router (navigation)

## 📊 Key Features

1. **User Authentication**
   - Register with name, email, password
   - Login with email and password
   - JWT token stored in localStorage
   - Protected routes

2. **Transaction Management**
   - Add income/expense with title, amount, date
   - View all transactions in table
   - Delete transactions
   - Transactions belong to logged-in user

3. **Financial Summary**
   - Total income displayed in green
   - Total expense displayed in red
   - Balance calculated automatically
   - Pie chart showing income vs. expense ratio

4. **UI/UX**
   - Dark mode support
   - Responsive design
   - Clean, modern interface
   - Responsive Dark Mode

## 🔐 Security Features

- Passwords hashed with bcrypt
- JWT tokens in Authorization header (`Bearer <token>`)
- Protected API routes requiring valid token
- No sensitive data in localStorage except token

## 🧪 Testing with Postman

1. **Register:**
   - POST `http://localhost:5000/api/auth/register`
   - Body: `{ "name": "John", "email": "john@example.com", "password": "123456" }`
   - Returns: `{ "_id": "...", "token": "..." }`

2. **Login:**
   - POST `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "john@example.com", "password": "123456" }`
   - Returns: `{ "_id": "...", "token": "..." }`

3. **Add Transaction (Protected):**
   - POST `http://localhost:5000/api/transactions`
   - Header: `Authorization: Bearer <token>`
   - Body: `{ "title": "Salary", "amount": 5000, "type": "income", "date": "2024-02-14T00:00:00Z" }`

4. **Get All Transactions (Protected):**
   - GET `http://localhost:5000/api/transactions`
   - Header: `Authorization: Bearer <token>`

5. **Get Summary (Protected):**
   - GET `http://localhost:5000/api/transactions/summary`
   - Header: `Authorization: Bearer <token>`
   - Returns: `{ "income": 5000, "expense": 500, "balance": 4500 }`

6. **Delete Transaction (Protected):**
   - DELETE `http://localhost:5000/api/transactions/<id>`
   - Header: `Authorization: Bearer <token>`

## 📝 Environment Variables

**Server (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=your_super_secret_key_here
```

## 🎯 Next Steps

1. Install dependencies for both server and client
2. Set up MongoDB (local or Atlas)
3. Configure `.env` in server folder
4. Run backend and frontend dev servers
5. Open `http://localhost:3000` in browser
6. Register a new account
7. Start tracking expenses!

## 📚 Code Quality

- Clean separation of concerns (MVC pattern in backend)
- Reusable components in frontend
- Error handling in all async operations
- Proper naming conventions
- Comments in important sections
- Null-safe patterns

---

**Happy tracking! 🎉**

## Deployment (Render / Railway / Vercel)

### Required environment variables

```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
ALLOW_IN_MEMORY_DB=false
```

### Render

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. Render will auto-detect `render.yaml`.
4. Set secret env vars (`MONGODB_URI`, `JWT_SECRET`).
5. Deploy.

### Railway

1. Create a new Railway project from this repo.
2. Railway will use `railway.json`.
3. Add env vars (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `ALLOW_IN_MEMORY_DB=false`).
4. Deploy.

### Vercel

1. Import this repo into Vercel.
2. Vercel will use `vercel.json`.
3. Add env vars (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `ALLOW_IN_MEMORY_DB=false`).
4. Deploy.

### Local production-like run

```sh
npm run web
```

App will be served from backend at `http://localhost:5000`.
