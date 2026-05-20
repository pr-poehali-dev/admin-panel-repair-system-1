import { useState } from 'react';
import AuthPage from '@/components/AuthPage';
import AdminLayout from '@/components/AdminLayout';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminLayout onLogout={() => setIsAuthenticated(false)} />;
}
