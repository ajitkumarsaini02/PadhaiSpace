# PadhaiSpace — Your Engineering Study Space

> **Notes, study material, previous year question papers, and exam resources — all in one place. 100% Free.**

PadhaiSpace is a modern open engineering study platform designed for B.Tech / B.E. computer science and engineering students. It provides unit-wise lecture notes, university previous year question papers (PYQs), and syllabus resources with a protected in-browser PDF viewer and cloud-backed storage.

---

## 🌟 Key Features

- **100% Free & Open Access**: Zero payments, subscriptions, or unlock walls. All academic materials are completely free for all engineering students.
- **200+ Organized Unit PDF Notes**: Over 208 clean, deduplicated study notes covering 29 B.Tech Computer Science subjects across all academic years.
- **Structured Notes Architecture**: Organizes lecture notes by coaching source (*Gateway Classes, EduShine Classes, Multi Atom, RRSIMT, Other Notes*), Academic Year (*1st Year - 4th Year*), Subject, and Unit.
- **Engineering PYQ Bank**: Filter previous year exam papers by Academic Year, Paper Year (*2026, 2025, 2024, etc.*), and Subject.
- **Supabase Cloud Storage Integration**: Powered by Supabase Storage (`@supabase/supabase-js`) for streaming large study materials (~2.85 GB) smoothly on serverless platforms like Vercel with zero file-size limits.
- **Protected PDF Viewer & Dynamic Watermarking**: High-performance browser PDF canvas reader with real-time user email watermarking, protected stream validation, and complete download protection.
- **Activity & Security Audit Tracking**: Tracks real-time resource interactions (`PDF_OPEN`, `PDF_VIEW`, `PDF_CLOSE`, `TAB_HIDDEN`, `TAB_VISIBLE`, `FULLSCREEN_ENTER`, `FULLSCREEN_EXIT`, `PRINT_ATTEMPT`).
- **Light, Dark & System Theme System**: Supports Light Mode, Dark Mode, and System Default (`prefers-color-scheme`) with zero-flash early script initialization.
- **Student Dashboard & Bookmarks**: Personalized student portal with college profile management and resource bookmarking.
- **Admin Management Console**: Dedicated portal for platform administration:
  - **Subjects & Units Management** (Create, Edit, Delete, Search)
  - **Resource Management** (Upload PDF notes, PYQs, assign source, academic & paper years)
  - **User Management** (Search, filter, view status, enable/disable student accounts)
  - **Resource Activity Audit** (View real-time MongoDB activity logs and event analytics)
  - **Database Sync & Deduplication Utilities** (`syncNotesToDb.js`, `checkDuplicates.js`)

---

## 🏗️ Core Academic Architecture

```
Subject
   ↓
  Unit
   ↓
Resource (MongoDB)
   ↓
Supabase Storage / Local Disk
   ↓
Protected Watermarked Viewer
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS (Vanilla CSS design system), Lucide React Icons, React Router v6, Axios, PDF.js
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Multer, `@supabase/supabase-js`
- **Cloud Storage**: Supabase Storage (`pdf-notes` bucket)
- **Database**: MongoDB & Mongoose (`mongodb://127.0.0.1:27017/padhaiSpace`)
- **Deployment**: Vercel (Frontend & Serverless API)

---

## 🔐 Security & Protection Architecture

- **Public Registration**: Strictly creates `role: "student"`. Incoming role payloads are ignored.
- **Admin Account**: Exactly one administrator account manually created directly in MongoDB (`role: "admin"`). No public admin signup route exists.
- **Protected Endpoints**: All `/api/admin/*` endpoints enforce `protect` (`authenticateUser`) and `adminOnly` (`requireAdmin`) middleware.
- **Watermarked PDF Stream**: Server fetches PDF from Supabase Storage / Protected Disk, applies real-time user watermark canvas overlay, and streams to browser inline.
- **Data Security**: Security secrets and password hashes are strictly excluded from client-facing responses (`.select('-password')`).
- **Defense-in-Depth**: NoSQL operator injection prevention (`express-mongo-sanitize`), path traversal defense (`path.basename`), ObjectId validation (`mongoose.Types.ObjectId.isValid`), rate limiting, and CORS configuration.

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

# Supabase Cloud Storage Setup
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-secret-key
SUPABASE_BUCKET=pdf-notes
```

### 3. Seed Initial Curriculum & Sync Notes
```bash
# Seed subjects and units
npm run seed

# Sync local PDF notes to MongoDB
node server/syncNotesToDb.js

# Clean duplicates
node server/checkDuplicates.js --clean
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
│   ├── config/                # MongoDB & Supabase Cloud Storage configuration
│   ├── controllers/           # Auth, Admin, Subject, Unit, Resource, Activity controllers
│   ├── middleware/            # JWT auth, admin validation, upload, error handler
│   ├── models/                # User, Subject, Unit, Resource, ResourceActivity, AuditLog models
│   ├── protected_uploads/     # Local Protected PDF notes storage
│   ├── routes/                # Express API routes
│   ├── seed/                  # Curriculum seeder script
│   ├── syncNotesToDb.js       # Disk-to-DB PDF Sync utility
│   ├── checkDuplicates.js     # DB Deduplication utility
│   └── server.js
│
├── package.json
└── README.md
```

---

## 📜 License & Academic Disclaimer

PadhaiSpace is an open educational resource platform for B.Tech engineering students. All syllabi, subject titles, and unit outlines are aligned with standard University Computer Science curricula.
