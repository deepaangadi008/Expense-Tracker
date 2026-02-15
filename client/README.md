# Smart Expense Tracker - Frontend

React + Vite + Tailwind CSS frontend for Smart Expense Tracker.

## Setup Instructions

1. **Install dependencies**
   ```sh
   cd expense-tracker/client
   npm install
   ```

2. **Configure API Endpoint**
   - Vite is configured to proxy `/api` to `http://localhost:5000`.
   - Backend should be running on port 5000.

3. **Development Server**
   ```sh
   npm run dev
   ```
   - Opens at `http://localhost:3000` by default.

4. **Production Build**
   ```sh
   npm run build
   npm run preview
   ```

## Features

- **Authentication:** Register/Login pages with JWT token storage.
- **Protected Routes:** Dashboard only accessible when logged in.
- **Add Transactions:** Form to add income/expense with title, amount, type, and date.
- **View Transactions:** Table showing all transactions; delete with confirmation.
- **Summary Cards:** Display total income, expense, and balance.
- **Pie Chart:** Visual representation of income vs. expense using Recharts.
- **Dark Mode:** Toggle button to switch light/dark theme (persists in DOM).
- **Responsive Design:** Mobile-friendly layout using Tailwind CSS.

## File Structure

- `src/pages/` – Login, Register, Dashboard pages.
- `src/components/` – Reusable UI components (Navbar, SummaryCard, etc.).
- `src/context/` – Auth context for user state management.
- `src/services/` – API client (axios) for backend communication.
- `src/App.jsx` – Main app with routing and route protection.
- `tailwind.config.js` – Tailwind CSS configuration.
- `vite.config.js` – Vite configuration.

## Running Locally

1. Start backend: `npm run dev` in `expense-tracker/server`.
2. Start frontend: `npm run dev` in `expense-tracker/client`.
3. Open `http://localhost:3000` in your browser.

## Troubleshooting

- **API calls failing:** Ensure backend is running on port 5000.
- **CORS error:** Backend should have CORS middleware enabled (it does).
- **Token issues:** Clear localStorage if you encounter auth errors.
