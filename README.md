# PadhaiSpace — Your Engineering Study Space

> **Notes, study material, previous year question papers, and exam resources — all in one place. 100% Free.**

PadhaiSpace is a modern open engineering study platform designed for B.Tech / B.E. computer science and engineering students. It provides unit-wise lecture notes, university previous year question papers (PYQs), and syllabus resources with a protected in-browser PDF viewer.

---

## 🌟 Key Features

- **100% Free & Open Access**: Zero payments, pricing, subscriptions, or unlock walls. All academic materials are completely free for all students.
- **Structured Notes Architecture**: Organizes lecture notes by coaching source (*Gateway Classes, EduShine Classes, Multi Atom, Other Notes*), Academic Year, Subject, and Unit.
- **Engineering PYQ Bank**: Filter previous year exam papers by Academic Year (*1st Year - 4th Year*), Paper Year (*2026, 2025, 2024, etc.*), and Subject.
- **Protected PDF Viewer & Activity Tracking**: High-performance browser PDF canvas reader with protected stream validation and real-time Resource Activity tracking (`PDF_OPEN`, `PDF_VIEW`, `PDF_CLOSE`, `TAB_HIDDEN`, `TAB_VISIBLE`, `FULLSCREEN_ENTER`, `FULLSCREEN_EXIT`, `PRINT_ATTEMPT`).
- **Light, Dark & System Theme System**: Supports Light Mode, Dark Mode, and System Default (`prefers-color-scheme`) with zero-flash early script initialization.
- **Student Dashboard & Bookmarks**: Personalized student dashboard with college profile management and resource bookmarking.
- **Admin Management Console**: Dedicated single-admin portal for platform management:
  - **Subjects & Units Management** (Create, Edit, Delete, Search)
  - **Resource Management** (Upload PDF notes, PYQs, assign source, academic & paper years)
  - **User Management** (Search, filter, view status, enable/disable student accounts)
  - **Resource Activity Audit** (View real-time MongoDB activity logs and event analytics)
  - **Audit Logs & Global Administrative Search**

---

## 🏗️ Core Academic Structure

```
Subject
   ↓
 Unit
   ↓
Resource
   ↓
Protected PDF
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS (Vanilla CSS design system), Lucide React Icons, React Router v6, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Multer
- **Database**: MongoDB & Mongoose (`mongodb://127.0.0.1:27017/padhaiSpace`)

---

## 🔐 Security & Role Architecture

- **Public Registration**: Strictly creates `role: "student"`. Incoming role payloads are ignored.
- **Admin Account**: Exactly one administrator account manually created directly in MongoDB (`role: "admin"`). No public admin signup route exists.
- **Protected Endpoints**: All `/api/admin/*` endpoints enforce `protect` (`authenticateUser`) and `adminOnly` (`requireAdmin`) middleware.
- **Data Protection**: Security secrets and password hashes are strictly excluded from client-facing responses (`.select('-password')`).
- **Security Defenses**: NoSQL operator injection prevention (`express-mongo-sanitize`), path traversal defense (`path.basename`), ObjectId validation (`mongoose.Types.ObjectId.isValid`), body size limits, rate limiting, and CORS configuration.

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Setup
Copy `.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/padhaiSpace
JWT_SECRET=YOUR_SECURE_RANDOM_JWT_SECRET
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed Initial Academic Curriculum Data
```bash
npm run seed
```

### 4. Create Owner Admin Account
```bash
node server/createAdmin.js
```

### 5. Start Development Server
```bash
npm run dev
```
- **Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📂 Project Structure

```text
PadhaiSpace/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Footer, PDFViewer, FilterBar, ThemeToggle, etc.
│   │   ├── context/           # AuthContext, ThemeContext & BookmarkContext
│   │   ├── pages/             # Student, Public, Admin, and Legal pages
│   │   │   └── admin/        # Admin Dashboard, Subjects, Units, Resources, Users, Activity
│   │   ├── services/          # Axios API Client & Services
│   │   └── App.jsx
│   └── index.html
│
├── server/                     # Express + MongoDB Backend
│   ├── config/                # MongoDB database configuration
│   ├── controllers/           # Auth, Admin, Subject, Unit, Resource, Activity controllers
│   ├── middleware/            # JWT auth, admin validation, upload, error handler
│   ├── models/                # User, Subject, Unit, Resource, ResourceActivity, AuditLog models
│   ├── routes/                # Express API routes
│   ├── seed/                  # Curriculum seeder script
│   └── server.js
│
├── package.json
└── README.md
```

---

## 📜 License & Academic Disclaimer

PadhaiSpace is an open educational resource platform for B.Tech engineering students. All syllabi, subject titles, and unit outlines are aligned with standard University Computer Science curricula.
