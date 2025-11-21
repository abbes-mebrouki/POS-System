import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Sale {
    id: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    user: { name: string };
}

export default function Dashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: sales } = useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            const res = await api.get('/sales');
            return res.data;
        },
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data;
        },
    });

    const lowStockCount = products?.filter((p: any) => p.stockLevel < 10).length || 0;

    const totalSales = sales?.reduce((sum: number, sale: Sale) => sum + Number(sale.total), 0) || 0;
    const totalTransactions = sales?.length || 0;

    const today = new Date();
    const todaysSales = sales?.filter((sale: Sale) => {
        const date = new Date(sale.createdAt);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }) || [];
    const todaysTotal = todaysSales.reduce((sum: number, sale: Sale) => sum + Number(sale.total), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-2 text-muted-foreground bg-card px-4 py-2 rounded-lg border shadow-sm">
                    <Clock size={20} />
                    <span className="font-medium font-mono text-lg">
                        {currentTime.toLocaleTimeString()}
                    </span>
                    <span className="text-sm border-l pl-2 ml-2">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${todaysTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {todaysSales.length} transactions today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                    </CardContent>
                </Card>
                <Dialog>
                    <DialogTrigger asChild>
                        <Card className={`cursor-pointer transition-colors hover:bg-accent/50 ${lowStockCount > 0 ? "border-red-500 bg-red-50 hover:bg-red-100" : ""}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                                <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : ""}`}>{lowStockCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    Items below 10 units
                                </p>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Low Stock Items</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-right">Stock Level</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products?.filter((p: any) => p.stockLevel < 10).map((product: any) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell className={`text-right font-bold ${product.stockLevel === 0 ? "text-red-600" : "text-orange-600"}`}>
                                                {product.stockLevel}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!products || products.filter((p: any) => p.stockLevel < 10).length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                No low stock items found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Cashier</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales?.slice(0, 10).map((sale: Sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-medium">{sale.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{sale.user?.name || 'Unknown'}</TableCell>
                                    <TableCell>{sale.paymentMethod}</TableCell>
                                    <TableCell className="text-right">${Number(sale.total).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
