import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './modules/Dashboard/pages/Dashboard';
import MainLayout from './components/layout/MainLayout';

import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './modules/Auth/pages/Login';
import Signup from './modules/Auth/pages/Signup';

import CreateInvoice from './modules/Invoices/pages/CreateInvoice';
import Invoices from './modules/Invoices/pages/Invoices';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import Settings from './modules/Settings/pages/Settings';
import Integrations from './modules/Settings/pages/Integrations';
import SalesNotebook from './modules/Sales/pages/SalesNotebook';
import Clients from './modules/Clients/pages/Clients';
import Payments from './modules/Payments/pages/Payments';
import Help from './modules/Help/pages/Help';
import Products from './modules/Products/pages/Products';
import Analytics from './modules/Analytics/pages/Analytics';
import AdminDashboard from './modules/Admin/pages/AdminDashboard';
import AdminUsers from './modules/Admin/pages/AdminUsers';
import AdminInvoices from './modules/Admin/pages/AdminInvoices';
import AdminStaff from './modules/Admin/pages/AdminStaff';
import AdminBroadcasts from './modules/Admin/pages/AdminBroadcasts';
import BillingDashboard from './modules/Billing/pages/BillingDashboard';
import PaymentCallback from './modules/Billing/pages/PaymentCallback';
import Services from './modules/Services/pages/Services';
import Availability from './modules/Services/pages/Availability';
import Bookings from './modules/Services/pages/Bookings';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
        <LayoutProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<MainLayout />}>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <SalesNotebook />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              } />
              <Route path="/invoices/create" element={
                <ProtectedRoute>
                  <CreateInvoice />
                </ProtectedRoute>
              } />
              
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } />
              
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } />

              <Route path="/billing" element={
                <ProtectedRoute>
                  <BillingDashboard />
                </ProtectedRoute>
              } />

              <Route path="/payment/callback" element={
                <ProtectedRoute>
                  <PaymentCallback />
                </ProtectedRoute>
              } />

              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />

              <Route path="/services" element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } />

              <Route path="/availability" element={
                <ProtectedRoute>
                  <Availability />
                </ProtectedRoute>
              } />

              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } />

              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/help" element={
                <ProtectedRoute>
                   <Help />
                </ProtectedRoute>
              } />

              <Route path="/integrations" element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Finance Admin', 'Support Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Support Admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/invoices" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Finance Admin']}>
                  <AdminInvoices />
                </ProtectedRoute>
              } />
              <Route path="/admin/broadcasts" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Support Admin']}>
                  <AdminBroadcasts />
                </ProtectedRoute>
              } />
              <Route path="/admin/staff" element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <AdminStaff />
                </ProtectedRoute>
              } />
          </Route>
        </Routes>
      </Router>
      </LayoutProvider>
      </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
