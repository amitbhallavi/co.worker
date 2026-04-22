<div align="center">

<img src="https://img.shields.io/badge/Co.Worker-Freelance%20Marketplace-3B7FF5?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzNCN0ZGNSIvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Dby48L3RleHQ+PC9zdmc+" alt="Co.Worker Logo" width="120"/>

# Co.Worker

### *Where Clients Meet the World's Best Freelancers*

**A full-stack freelance marketplace platform built for the modern economy.**  
Post projects. Bid on work. Get paid. All in one place.

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-22C55E?style=flat-square)]()
[![Deploy](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://co-worker-sable.vercel.app)

<br/>

[**Live Demo →**](https://co-worker-sable.vercel.app) &nbsp;·&nbsp; [**GitHub →**](https://github.com/amitbhallavi/co.worker) &nbsp;·&nbsp; [**Report Bug**](https://github.com/amitbhallavi/co.worker/issues)

</div>

---

## 🚀 What is Co.Worker?

**Co.Worker** is a production-grade freelance marketplace where **clients post projects** and **freelancers bid to win work** — similar to Fiverr and Upwork, but built from scratch with modern architecture.

| For Clients | For Freelancers |
|-------------|-----------------|
| Post projects with budget & duration | Build a verified profile & portfolio |
| Browse top talent by category & skill | Bid on projects that match your expertise |
| Secure escrow payment system | Real-time chat with clients |
| Release payment on completion | Get paid to your wallet — withdraw anytime |
| Rate & review your freelancer | Build reputation through ratings |

---

## ✨ Core Features

### 👤 User System
- Dual role — switch between **Client** and **Freelancer** mode
- JWT-based authentication with protected routes
- Profile pages with avatar, bio, skills, and portfolio
- Verified freelancer badge system

### 📋 Project & Bidding System
- Clients post projects with title, budget, duration, and required tech stack
- Freelancers browse and **place bids** with custom proposals
- Real-time bid tracking and status updates
- Category filters — Web Dev, UI/UX, AI/ML, Full Stack, and more

### 💬 Real-Time Chat
- **Socket.io** powered instant messaging
- Typing indicators and online/offline status
- Seen receipts (✓✓)
- Unread badge count on navbar
- Persistent conversation history

### 💳 Secure Payment & Escrow System
- **Razorpay** integration for client payments
- **Escrow model** — money is held by platform until work is approved
- 24-hour auto-release timer after client marks project complete
- Freelancer wallet with withdrawable and pending balance
- Withdrawal request system with admin approval

### 🏦 Wallet System
- Real-time balance tracking
- Full transaction history
- Withdrawal via UPI or Bank Transfer
- Platform fee deduction on each transaction

### ⭐ Ratings & Reviews
- Clients rate freelancers after project completion
- Star rating + written review
- Rating displayed on freelancer profile and talent cards

### 🛡️ Admin Dashboard
- View and manage all payments and escrow
- Approve or reject withdrawal requests
- Monitor platform activity

### 📱 Fully Responsive
- Mobile-first design
- Tailwind CSS utility-first styling
- Works across all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Redux Toolkit, React Router v6 |
| **Styling** | Tailwind CSS, Custom Animations |
| **State Management** | Redux Toolkit, RTK Thunks |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Real-Time** | Socket.io (WebSockets) |
| **Payments** | Razorpay (Orders + Signature Verification) |
| **Auth** | JWT (JSON Web Tokens) |
| **Deployment** | Vercel (Frontend) + Render (Backend) |
| **Scheduling** | node-cron (auto escrow release) |

---

## 📸 Screenshots

> Screenshots from the live production app

### 🏠 Talent Discovery Page
![Talent Page](https://via.placeholder.com/900x500/0F172A/3B7FF5?text=Talent+Discovery+%E2%80%94+Browse+Verified+Freelancers)

### 👤 Freelancer Profile
![Freelancer Profile](https://via.placeholder.com/900x500/F9FAFB/3B7FF5?text=Freelancer+Profile+%E2%80%94+Portfolio+%2B+Skills+%2B+Stats)

### 💬 Real-Time Chat
![Chat](https://via.placeholder.com/900x500/1E293B/2BC4D4?text=Real-Time+Chat+%E2%80%94+Socket.io+Powered)

### 💼 Find Work (Browse Projects)
![Find Work](https://via.placeholder.com/900x500/F9FAFB/3B7FF5?text=Browse+Projects+%E2%80%94+Filter+%2B+Search+%2B+Bid)

### 💰 Wallet Dashboard
![Wallet](https://via.placeholder.com/900x500/EFF6FF/1D4ED8?text=Freelancer+Wallet+%E2%80%94+Balance+%2B+Transactions+%2B+Withdraw)

---

## 💳 Payment Flow

```
CLIENT PAYS
    │
    ▼
┌─────────────────────────────────────────────┐
│          RAZORPAY PAYMENT GATEWAY           │
│   (Signature verified on backend — secure)  │
└─────────────────────────────────────────────┘
    │
    ▼
ESCROW (Platform holds funds)
    │
    ▼ Client marks project complete
PENDING RELEASE (24hr review window)
    │
    ▼ Auto-released via cron job
FREELANCER WALLET (withdrawable balance)
    │
    ▼ Freelancer requests withdrawal
BANK / UPI (Admin processes payout)
```

**Platform fee** is deducted per category (₹11–₹24) at time of payment.  
**No fake payments** — Razorpay signature is verified server-side before any escrow is created.

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account

### 1. Clone the Repository
```bash
git clone https://github.com/amitbhallavi/co.worker.git
cd co.worker
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create `.env` in the `/server` folder:
```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/coworker

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# App
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `.env` in the `/client` folder:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the Application

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

> App runs on `http://localhost:5173`

---

## 📁 Project Structure

```
co.worker/
│
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Redux slices (auth, project, freelancer, wallet, chat)
│   │   ├── pages/              # Page components (Home, Profile, Chat, Wallet...)
│   │   ├── app/                # Redux store configuration
│   │   └── main.jsx            # App entry point
│   └── vite.config.js
│
├── server/                     # Node.js Backend
│   ├── controllers/            # Business logic (auth, project, payment, wallet, chat)
│   ├── models/                 # Mongoose schemas (User, Project, Payment, Wallet...)
│   ├── routes/                 # Express route definitions
│   ├── middleware/             # Auth middleware (JWT protect)
│   ├── socket/                 # Socket.io handler
│   └── server.js               # Express + HTTP server entry
│
└── README.md
```

---

## 🔐 Environment Variables Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret key for JWT signing |
| `RAZORPAY_KEY_ID` | server | Razorpay API key (public) |
| `RAZORPAY_KEY_SECRET` | server | Razorpay API secret |
| `CLIENT_URL` | server | Frontend URL (for CORS + Socket) |
| `PORT` | server | Backend server port (default 5000) |
| `VITE_API_URL` | client | Backend API base URL |

---

## 🗺️ Roadmap

| Feature | Status |
|---------|--------|
| ✅ User Authentication (JWT) | Done |
| ✅ Freelancer Profile & Portfolio | Done |
| ✅ Project Posting & Bidding | Done |
| ✅ Real-Time Chat (Socket.io) | Done |
| ✅ Escrow Payment System (Razorpay) | Done |
| ✅ Wallet + Withdrawal System | Done |
| ✅ Admin Dashboard | Done |
| ✅ Responsive UI | Done |
| 🔄 Ratings & Reviews System | In Progress |
| 🔄 Notifications (in-app + email) | Planned |
| 🔄 AI-powered freelancer matching | Planned |
| 🔄 Advanced analytics dashboard | Planned |
| 🔄 Mobile app (React Native) | Planned |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please follow the existing code style and keep PRs focused on a single feature or fix.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Amit Bhallavi**

[![GitHub](https://img.shields.io/badge/GitHub-amitbhallavi-181717?style=flat-square&logo=github)](https://github.com/amitbhallavi)
[![Live App](https://img.shields.io/badge/Live-co--worker--sable.vercel.app-3B7FF5?style=flat-square&logo=vercel)](https://co-worker-sable.vercel.app)

*Built with ❤️ — MERN Stack · Socket.io · Razorpay*

</div>

---

<div align="center">

**If this project helped you, please consider giving it a ⭐**

[![Star on GitHub](https://img.shields.io/github/stars/amitbhallavi/co.worker?style=social)](https://github.com/amitbhallavi/co.worker)

</div>
