import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedLayout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
                        <nav className="flex gap-4">
                            <a href="/" className="text-gray-600 hover:text-gray-900">Dashboard</a>
                            <a href="/pos" className="text-gray-600 hover:text-gray-900">POS</a>
                            <a href="/products" className="text-gray-600 hover:text-gray-900">Products</a>
                            <a href="/sales" className="text-gray-600 hover:text-gray-900">Sales</a>
                        </nav>
                    </div>
                    <button
                        onClick={() => useAuthStore.getState().logout()}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
