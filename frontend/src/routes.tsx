import { createBrowserRouter, RouteObject } from 'react-router';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { SecurityPage } from './pages/SecurityPage/SecurityPage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { MainLayout } from './components/layout/MainLayout';
import { AuthGuard } from './components/AuthGuard';
import { AccountVerification } from './components/auth/AccountVerification';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUserListPage } from './pages/admin/AdminUserListPage';
import { AdminRolesPage } from './pages/admin/AdminRolesPage';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { AdminCreateUserPage } from './pages/admin/AdminCreateUserPage';
import { AdminEditUserPage } from './pages/admin/AdminEditUserPage';

const protectedRoutes = (children: RouteObject[]): RouteObject[] => {
    return children.map(route => ({
        ...route,
        element: <AuthGuard>{route.element}</AuthGuard>,
        children: route.children ? protectedRoutes(route.children) : undefined,
    } as RouteObject));
};

const adminRoutes = (children: RouteObject[]): RouteObject[] => {
    return children.map(route => ({
        ...route,
        element: <AuthGuard requiredRole="admin">{route.element}</AuthGuard>,
        children: route.children ? adminRoutes(route.children) : undefined,
    } as RouteObject));
};

const routes: RouteObject[] = [
    // Public routes
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
    {
        path: '/verify-email',
        element: <AccountVerification />,
    },

    // Protected routes with main layout
    ...protectedRoutes([
        {
            path: '/',
            element: <MainLayout />,
            children: [
                {
                    path: 'dashboard',
                    element: <DashboardPage />,
                },
                {
                    path: 'profile',
                    element: <ProfilePage />,
                },
                {
                    path: 'security',
                    element: <SecurityPage />,
                },

                // Admin routes
                ...adminRoutes([
                    {
                        path: 'admin',
                        element: <AdminDashboardPage />,
                    },
                    {
                        path: 'admin/users',
                        element: <AdminUserListPage />,
                    },
                    {
                        path: 'admin/users/create',
                        element: <AdminCreateUserPage />,
                    },
                    {
                        path: 'admin/users/:userId/edit',
                        element: <AdminEditUserPage />,
                    },
                    {
                        path: 'admin/roles',
                        element: <AdminRolesPage />,
                    },
                ]),
            ],
        },
    ]),

    // 404 page
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

export const router = createBrowserRouter(routes);
