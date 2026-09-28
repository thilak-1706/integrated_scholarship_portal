import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Auth Page
import AdminLogin from './pages/auth/AdminLogin';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminInstitutions from './pages/admin/AdminInstitutions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApplications from './pages/admin/AdminApplications';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminNotifications from './pages/admin/AdminNotifications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Auth */}
          <Route path="/" element={<AdminLogin />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Admin Portal Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scholarships"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminScholarships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDepartments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/institutions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminInstitutions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to admin login */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
