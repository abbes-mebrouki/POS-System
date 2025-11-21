import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import ProductGrid from '@/components/pos/ProductGrid';
import Cart from '@/components/pos/Cart';
import PaymentModal from '@/components/pos/PaymentModal';
import { Input } from '@/components/ui/input';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { saveOfflineSale } from '@/lib/storage';
import { cacheProducts, getOfflineProducts, syncData } from '@/lib/sync';
import { printReceipt } from '@/lib/printReceipt';
import { Link } from 'react-router-dom';
import { Search, Wifi, WifiOff, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

interface Product {
    id: string;
    name: string;
    price: number;
    stockLevel: number;
    category?: string;
}

export default function POSRegister() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const isOnline = useNetworkStatus();
    const { logout, user } = useAuthStore();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            if (isOnline) {
                const res = await api.get('/products');
                await cacheProducts(res.data);
                return res.data;
            } else {
                return await getOfflineProducts();
            }
        },
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (isOnline) {
            syncData().then(() => {
                console.log('Sync completed');
            });
        }
    }, [isOnline]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };
    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    const handlePaymentComplete = async (method: string, details?: any) => {
        setIsProcessing(true);
        try {
            const saleData = {
                items: cart.map((item) => ({
                    productId: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: Number(item.product.price),
                })),
                paymentMethod: method,
                paymentDetails: details,
            };

            let saleId;
            if (isOnline) {
                const res = await api.post('/sales', saleData);
                saleId = res.data.id;
            } else {
                saleId = await saveOfflineSale(saleData);
            }

            // Custom toast or alert could be better here
            // alert('Sale completed successfully!');

            if (confirm('Do you want to print a receipt?')) {
                printReceipt({ ...saleData, id: saleId });
            }

            setCart([]);
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredProducts = products?.filter((p: Product) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
            {/* Main Content - Product Grid */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-muted-foreground">
                            {user?.name}
                        </div>
                        {user?.role === 'ADMIN' && (
                            <Link to="/admin">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                        <Badge variant={isOnline ? "default" : "destructive"} className="gap-1.5 py-1.5 px-3">
                            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                            {isOnline ? 'Online' : 'Offline Mode'}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Product Grid Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Loading products...
                        </div>
                    ) : (
                        <ProductGrid products={filteredProducts || []} onAddToCart={addToCart} />
                    )}
                </main>
            </div>

            {/* Right Sidebar - Cart */}
            <aside className="w-[400px] bg-white border-l shadow-xl z-10 flex flex-col h-full">
                <div className="h-16 border-b flex items-center px-6 shrink-0 bg-white">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Current Sale
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                        {cart.length} items
                    </Badge>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Cart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                        onClear={() => setCart([])}
                        onCheckout={handleCheckout}
                        isProcessing={isProcessing}
                    />
                </div>
            </aside>

            <PaymentModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                total={total}
                onComplete={handlePaymentComplete}
            />
        </div>
    );
}
