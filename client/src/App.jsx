import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Notes from './pages/Notes';
import NotesSource from './pages/NotesSource';
import PYQs from './pages/PYQs';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import SearchResults from './pages/SearchResults';
import PDFReader from './pages/PDFReader';
import Bookmarks from './pages/Bookmarks';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Disclaimer from './pages/Disclaimer';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminUnits from './pages/admin/AdminUnits';
import AdminResources from './pages/admin/AdminResources';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSearch from './pages/admin/AdminSearch';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Academic Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/source/:sourceSlug" element={<NotesSource />} />
          <Route path="/pyqs" element={<PYQs />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Student Protected Routes */}
          <Route
            path="/resources/:id/view"
            element={
              <ProtectedRoute>
                <PDFReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/:id/read"
            element={
              <ProtectedRoute>
                <PDFReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Information & Legal Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <AdminRoute>
                <AdminSubjects />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/units"
            element={
              <AdminRoute>
                <AdminUnits />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <AdminRoute>
                <AdminResources />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/resource-activities"
            element={
              <AdminRoute>
                <AdminActivityLog />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <AdminRoute>
                <AdminActivityLog />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminAuditLogs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/search"
            element={
              <AdminRoute>
                <AdminSearch />
              </AdminRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
