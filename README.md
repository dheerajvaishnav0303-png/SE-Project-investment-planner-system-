# Investment Planner System (IPS)

A modern, production-grade full-stack Fintech Investment Planning & Portfolio Management System built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

---

## 🌟 Key Features

### 👤 Customer / User Portal
- **Strict Multi-User Isolation**: Every user has completely private data (investments, SIPs, goals, transactions, notifications, calculations). Zero data leakage between accounts.
- **Smart Empty States**: Fresh accounts start with clean ₹0 balances and guided onboarding actions.
- **Interactive Portfolio Analytics**: Real-time asset distribution breakdown (Equity, Mutual Funds, Fixed Deposits, Gold, Crypto) and P&L monitoring.
- **SIP & Goal Tracking**: Track recurring SIPs and progress toward financial milestones with visual progress bars.
- **5 Built-in Financial Calculators**:
  - SIP Calculator (with compounding breakdown)
  - Lumpsum Investment Calculator
  - Compound Interest Calculator
  - Retirement Corpus Planner
  - Goal-based Investment Calculator
- **Audit Transactions & Notifications**: Instant transaction logging and real-time user alert feed.

### 🛡️ Admin Management Suite
- **Fintech Admin Dashboard**: Live summary metrics (Total AUM, Active Investors, Investment Catalog size, Pending Transactions).
- **User Management**: Search, filter, view investor profiles, toggle account statuses (Active / Suspended), and review individual portfolios.
- **Investment Catalog Management**: Publish, update, and manage official investment instruments across various risk tiers.
- **Transaction Approvals**: Approve or reject user transaction orders with audit logs.
- **System Health Diagnostics**: Real-time MongoDB connection latency and database statistics.
- **CSV Data Export**: One-click reports export for users, investments, and transactions.

---

## 🏗️ Architecture

```
investment-planner/
├── backend/                       # Node.js + Express + Mongoose
│   ├── src/
│   │   ├── config/                # MongoDB & environment config
│   │   ├── controllers/           # Auth, User, Admin, Investment, Goal, SIP controllers
│   │   ├── middleware/            # JWT auth & role-based access control (adminAuth)
│   │   ├── models/                # User, Investment, Goal, SIP, Transaction, Notification models
│   │   ├── routes/                # Modular REST API endpoints
│   │   └── server.js              # Express app bootstrap
│   ├── .env.example               # Environment variables template
│   └── package.json
├── frontend/                      # React 18 + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/            # Customer Portal, Admin Portal, Modal dialogs, Calculators
│   │   ├── services/              # API Client with token management
│   │   ├── App.jsx                # Main application orchestrator
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas cluster)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure environment variables in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/investment_planner
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

Start the backend:
```bash
npm run dev
# or for production:
npm start
```
The server runs on `http://localhost:5000`. Verify with `http://localhost:5000/api/health`.

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔒 Security & Data Isolation
- **Role-Based Access Control (RBAC)**: Enforced both on client-side routing and strictly on backend routes (`authMiddleware`, `adminOnlyMiddleware`).
- **Owner-Scoped Queries**: All customer operations automatically bind to `req.user._id`, ensuring users cannot access or tamper with data belonging to other accounts.
- **Password Security**: Passwords hashed with `bcryptjs`.
- **JWT Authorization**: Bearer tokens used for stateless, secure session authorization.

---

## 📄 License
ISC License
