# PadhaiSpace — Your Engineering Study Space

> **Notes, study material, previous papers and exam resources — all in one place.**

PadhaiSpace is a modern engineering study platform specifically designed for B.Tech / B.E. students enrolled in **CSE (Computer Science & Engineering)**, **CSE-AIML (Artificial Intelligence & Machine Learning)**, and **CSE-DS (Data Science)** branches.

---

## 🌟 Key Features

- **Semester & Unit-Wise Notes**: Access structured handwritten and digital notes for core engineering subjects.
- **Previous Year Question Papers (PYQs)**: Filter PYQ papers by Branch, Semester, Subject, Year, and Exam Type (Mid Semester, End Semester, University Exam).
- **Unit-Wise PDFs**: Highlighting key syllabus topics across Unit 1 to Unit 5.
- **Built-in PDF Viewer**: Instant PDF reading, downloading, and bookmarking.
- **Student Dashboard & Bookmarks**: Personalized student dashboard with college profile management and bookmarking system.
- **Admin Management Portal**: Single-admin portal for uploading and managing branches, subjects, units, notes, and PYQ papers.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React Icons, React Router v6, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Multer
- **Database**: MongoDB & Mongoose (Local MongoDB: `mongodb://127.0.0.1:27017/padhaiSpace`)

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Seed Academic Curriculum Data
```bash
npm run seed
```

### 3. Start Development Server (Monorepo)
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Backend server runs on: `http://localhost:5000`

---

## 🔒 Account Management & Administration

- **Student Accounts**: Created via public student registration (`/register`).
- **Admin Account**: Exactly one administrator account manually created directly in MongoDB (`padhaiSpace.users` collection with `role: "admin"` and hashed password). There is no admin registration interface.

---

## 📂 Project Structure

```text
PadhaiSpace/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Footer, ResourceCard, PDFViewerModal, etc.
│   │   ├── context/           # AuthContext & BookmarkContext
│   │   ├── pages/             # Student, Public, Admin, and Legal pages
│   │   ├── services/          # Axios API Service Modules
│   │   └── App.jsx
│   └── vite.config.js
│
├── server/                     # Express + MongoDB Backend
│   ├── config/                # Local MongoDB connection
│   ├── controllers/           # Auth, Branch, Semester, Subject, Unit, Resource controllers
│   ├── middleware/            # JWT auth, role validation, multer upload
│   ├── models/                # User, Branch, Semester, Subject, Unit, Resource schemas
│   ├── routes/                # Express API routes
│   ├── seed/                  # Seeder script populating CSE/CSE-AIML/CSE-DS curriculum
│   └── server.js
│
├── .env
├── package.json
└── README.md
```
