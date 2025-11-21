import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, CreditCard, Package } from 'lucide-react';

interface Sale {
    id: string;
    total: string;
    paymentMethod: string;
    createdAt: string;
    items: {
        id: string;
        product: {
            name: string;
        };
        quantity: number;
        price: string;
    }[];
}

export default function CashierHistory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: sales, isLoading } = useQuery<Sale[]>({
        queryKey: ['sales', id],
        queryFn: async () => {
            const response = await api.get(`/sales/user/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const groupedSales = sales?.reduce((groups, sale) => {
        const date = new Date(sale.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let key = format(date, 'MMMM d, yyyy');
        if (date.toDateString() === today.toDateString()) {
            key = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            key = 'Yesterday';
        }

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(sale);
        return groups;
    }, {} as Record<string, Sale[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading history...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
                    <p className="text-muted-foreground">Detailed timeline of all transactions</p>
                </div>
            </div>

            {!sales?.length ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mb-4 opacity-20" />
                        <p>No transactions found for this user.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedSales || {}).map(([date, dateSales]) => (
                        <div key={date} className="relative">
                            <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-2 mb-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    {date}
                                </h3>
                            </div>

                            <div className="space-y-6 ml-4 border-l-2 border-gray-200 pl-6 pb-4">
                                {dateSales.map((sale) => (
                                    <div key={sale.id} className="relative">
                                        {/* Timeline dot */}
                                        <div className="absolute -left-[31px] top-6 h-4 w-4 rounded-full border-2 border-primary bg-white" />

                                        <Card className="hover:shadow-md transition-shadow duration-200">
                                            <CardHeader className="pb-3 bg-gray-50/50 border-b">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            {format(new Date(sale.createdAt), 'HH:mm')}
                                                        </div>
                                                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                            #{sale.id.slice(0, 8)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="capitalize gap-1">
                                                            <CreditCard className="h-3 w-3" />
                                                            {sale.paymentMethod?.replace('_', ' ') || 'Cash'}
                                                        </Badge>
                                                        <div className="text-lg font-bold text-primary">
                                                            ${parseFloat(sale.total).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="space-y-3">
                                                    <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        Items Purchased
                                                    </div>
                                                    <div className="grid gap-2">
                                                        {sale.items.map((item) => (
                                                            <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-bold w-8 text-center bg-gray-100 rounded py-0.5">
                                                                        {item.quantity}x
                                                                    </span>
                                                                    <span className="font-medium">{item.product?.name || 'Unknown Product'}</span>
                                                                </div>
                                                                <span className="text-muted-foreground">
                                                                    ${parseFloat(item.price).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-3 mt-3 border-t flex justify-end text-sm text-muted-foreground">
                                                        Total Items: {sale.items.reduce((acc, item) => acc + item.quantity, 0)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
