# PadhaiSpace — Your Engineering Study Space

> **Notes, unit PDFs, previous year papers, syllabi, exam resources, and ₹9 subject unlocking — all in one place.**

PadhaiSpace is a modern engineering study platform specifically designed for B.Tech / B.E. students enrolled in **CSE (Computer Science & Engineering)**, **CSE-AIML (Artificial Intelligence & Machine Learning)**, and **CSE-DS (Data Science)** branches.

---

## 🌟 Key Features

- **Semester & Unit-Wise Notes**: Structured notes and unit-wise PDFs highlighting key syllabus topics across Unit 1 to Unit 5.
- **Previous Year Question Papers (PYQs)**: Filter PYQ papers by Branch, Semester, Subject, Year, and Exam Type (Mid Semester, End Semester, University Exam).
- **Protected PDF Viewer & Activity Logging**: High-performance browser PDF reading with audit logging for activity events (`PDF_OPEN`, `PDF_VIEW`, `PDF_CLOSE`, `TAB_HIDDEN`, `FULLSCREEN_ENTER`, `PRINT_ATTEMPT`).
- **₹9 Subject Unlocking & Razorpay Integration**: Modular payment gateway unlocking full subject access across all 5 units for a one-time ₹9 payment.
- **Student Portal**: Dashboard, college profile management, transaction history, and bookmarking system.
- **Admin Full Platform Control**: Single-admin management portal for:
  - Student Accounts (Search, filter, view status, enable/disable accounts)
  - Branches, Semesters, Subjects, Units & PDF Resources
  - Payment Transactions (Track revenue, view successful, pending, failed, refunded payments)
  - Subject Access Control (View entitlements, grant/revoke manual access with audit logs)
  - Security Audit Logs & Global Administrative Search
  - Payment Bypass for Admin PDF Viewing

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS (Restrained Deep Navy Palette), Lucide React Icons, React Router v6, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Multer, Razorpay Node SDK
- **Database**: MongoDB & Mongoose (Local MongoDB or MongoDB Atlas)

---

## 🔐 Security & Role Architecture

- **Public Registration**: Strictly creates `role: "student"`.
- **Admin Account**: Exactly one administrator account manually created directly in MongoDB (`padhaiSpace.users` collection with `role: "admin"`). No public admin signup route exists.
- **Secrets Protection**: Security secrets (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `MONGODB_URI`, password hashes) are strictly excluded from all client-facing APIs and views.
- **Server Authorization**: All `/api/admin/*` endpoints enforce `protect` (`authenticateUser`) and `adminOnly` (`requireAdmin`) middlewares.

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Setup
Copy `.env.example` to `.env` in the root and `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/padhaiSpace
JWT_SECRET=YOUR_SECURE_RANDOM_JWT_SECRET
NODE_ENV=development
CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET
```

### 3. Seed Academic Curriculum Data
```bash
npm run seed
```

### 4. Create Admin Account
```bash
node server/createAdmin.js
```

### 5. Start Development Server
```bash
npm run dev
```
- Client: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## ☁️ Production Deployment

1. **Database**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and get your `MONGODB_URI`.
2. **Backend (Render / Railway)**:
   - Connect GitHub repo: `https://github.com/ajitkumarsaini02/PadhaiSpace.git`
   - Set Root Directory: `server`
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`
   - Add environment variables (`MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL`)
3. **Frontend (Vercel / Netlify)**:
   - Connect GitHub repo with Root Directory: `client`
   - Set Build Command: `npm run build` & Output Directory: `dist`
   - Add Environment Variable: `VITE_API_BASE_URL=https://your-backend-url.onrender.com/api`

---

## 📂 Project Structure

```text
PadhaiSpace/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Footer, PDFViewer, FilterBar, etc.
│   │   ├── context/           # AuthContext, ThemeContext & BookmarkContext
│   │   ├── pages/             # Student, Public, Admin, and Legal pages
│   │   │   └── admin/        # Admin Dashboard, Users, Payments, Access, Search, Logs
│   │   ├── services/          # Axios API Client & Services
│   │   └── App.jsx
│   └── vite.config.js
│
├── server/                     # Express + MongoDB Backend
│   ├── config/                # MongoDB & Razorpay configuration
│   ├── controllers/           # Auth, Admin, Branch, Payment, Resource, Activity controllers
│   ├── middleware/            # JWT auth, admin validation, upload, error handler
│   ├── models/                # User, Branch, Subject, Resource, Payment, AuditLog models
│   ├── routes/                # Express API routes
│   ├── seed/                  # Curriculum seeder script
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## 📜 License & Academic Disclaimer

PadhaiSpace is an open educational resource platform for B.Tech engineering students. All syllabi, subject titles, and unit outlines are aligned with standard University Computer Science curricula.
