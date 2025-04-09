import HomePage from '@/pages/Home';
import LoginPage from '@/features/auth/pages/Login';
import DashboardPage from '@/features/dashboard/pages/Dashboard';
import UserProfile from '@/features/user/pages/Profile';
import AdminPanel from '@/features/admin/pages/AdminPanel';

const publicRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> }
];

const privateRoutes = [
  { path: '/dashboard', element: <DashboardPage />, requiresAuth: true },
  { path: '/profile', element: <UserProfile />, requiresAuth: true }
];

const adminRoutes = [{ path: '/admin', element: <AdminPanel />, requiresAdmin: true }];

export { publicRoutes, privateRoutes, adminRoutes };
