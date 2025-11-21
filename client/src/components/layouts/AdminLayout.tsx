import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Package, ShoppingCart, Monitor } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div className="w-64 border-r bg-card flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-primary">Admin Portal</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin">
                        <Button
                            variant={isActive('/admin') ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </Button>
                    </Link>
                    <Link to="/admin/users">
                        <Button
                            variant={isActive('/admin/users') ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                        >
                            <Users size={20} />
                            Users
                        </Button>
                    </Link>
                    <Link to="/admin/products">
                        <Button
                            variant={isActive('/admin/products') ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                        >
                            <Package size={20} />
                            Products
                        </Button>
                    </Link>
                    <Link to="/admin/sales">
                        <Button
                            variant={isActive('/admin/sales') ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                        >
                            <ShoppingCart size={20} />
                            Sales
                        </Button>
                    </Link>
                    <Link to="/pos">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Monitor size={20} />
                            POS System
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={logout}
                    >
                        <LogOut size={20} />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
