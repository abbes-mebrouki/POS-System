import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthLayout from '@/components/layouts/AuthLayout';
import Login from '@/pages/auth/Login';
import POSRegister from '@/pages/pos/POSRegister';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import AdminLayout from '@/components/layouts/AdminLayout';
import UserList from '@/pages/admin/UserList';
import CashierHistory from '@/pages/admin/CashierHistory';
import Dashboard from '@/pages/admin/Dashboard';
import ProductList from '@/pages/admin/ProductList';
import SalesList from '@/pages/admin/SalesList';

const queryClient = new QueryClient();

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

function AppContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/pos" element={<POSRegister />} />
      </Route>

      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/users/:id/history" element={<CashierHistory />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/sales" element={<SalesList />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/pos" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
