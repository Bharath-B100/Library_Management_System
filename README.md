# LibraVault — Library Management System

A premium full-stack Library Management System built with React + Vite, Node.js + Express, and MongoDB.

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
npm run dev   # Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev   # Runs on http://localhost:5173
```

---

## ⚙️ Environment Variables

### `backend/.env`
| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | local |
| `JWT_SECRET` | JWT signing secret | **Change this!** |
| `ADMIN_SECRET` | Secret key for admin registration | `libraryadmin2024` |
| `FINE_PER_DAY` | Fine per overdue day (₹) | `5` |
| `BORROW_DAYS` | Loan duration in days | `14` |

---

## 👤 First-Time Setup (No Sample Data)

### Create Admin Account
1. Go to `/login` → Click **Admin Login** tab → **Register with secret key**
2. Enter your details + the `ADMIN_SECRET` from your `.env` file
3. You're in as Admin!

### Create User Account
- Go to `/login` → Click **Register** as a normal user

---

## 🏗️ Project Structure
```
Library Management System/
├── backend/
│   ├── config/db.js
│   ├── controllers/      # authController, bookController, borrowController, userController
│   ├── middleware/       # authMiddleware, uploadMiddleware
│   ├── models/           # User, Book, BorrowRecord
│   ├── routes/           # authRoutes, bookRoutes, borrowRoutes, userRoutes
│   ├── utils/            # generateToken
│   ├── uploads/          # covers/ and pdfs/ (auto-created)
│   └── server.js
├── frontend/
│   └── src/
│       ├── context/      # AuthContext, ThemeContext
│       ├── layouts/      # AdminLayout, UserLayout
│       ├── pages/
│       │   ├── admin/    # Dashboard, Books, Users, Borrows
│       │   └── user/     # Dashboard, Library, MyBooks, History
│       ├── services/api.js
│       └── App.jsx
└── README.md
```

---

## 🚀 Deploy to Render

### Backend
1. Create a new **Web Service** on Render
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. Add Environment Variables from the table above (use MongoDB Atlas URI)
6. Set `CLIENT_URL` to your frontend URL (e.g., `https://libravault.vercel.app`)

### Frontend (Vercel recommended)
1. Create a new project on Vercel
2. Set **Root Directory** to `frontend`
3. Add `VITE_API_URL` = your Render backend URL
4. Update `vite.config.js` proxy or use `import.meta.env.VITE_API_URL` in api.js

---

## ✨ Features
- 🔐 Separate Admin & User login portals
- 📚 Book CRUD with cover image + PDF upload
- 🔍 Search & category filter
- 📖 Borrow & return with copy management
- 📊 Admin dashboard with stats & category charts
- 👥 User management with activate/block
- 💰 Automatic fine calculation (₹5/day overdue)
- ⏰ Due date reminders on user dashboard
- 🌙 Dark/Light mode toggle
- 📱 Responsive mobile UI
