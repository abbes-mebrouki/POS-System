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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Sale {
    id: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    user: { name: string };
    items: { product: { name: string }; quantity: number; price: number }[];
}

export default function SalesList() {
    const { data: sales, isLoading } = useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            const res = await api.get('/sales');
            return res.data;
        },
    });

    const groupedSales = sales?.reduce((groups: Record<string, Sale[]>, sale: Sale) => {
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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Sales History</h1>

            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading sales history...</div>
            ) : (
                (Object.entries(groupedSales || {}) as [string, Sale[]][]).map(([date, dateSales]) => (
                    <Card key={date} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 py-3">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                {date}
                                <Badge variant="secondary" className="ml-2 text-xs font-normal">
                                    {dateSales.length} transactions
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Cashier</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dateSales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {sale.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>{format(new Date(sale.createdAt), 'HH:mm')}</TableCell>
                                            <TableCell>{sale.user?.name || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{sale.items?.length || 0} items</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {sale.items?.map(i => i.product?.name).join(', ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{sale.paymentMethod}</TableCell>
                                            <TableCell>
                                                <Badge variant={sale.status === 'COMPLETED' ? 'default' : 'destructive'}>
                                                    {sale.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${Number(sale.total).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            )}

            {!isLoading && (!sales || sales.length === 0) && (
                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                    No sales records found.
                </div>
            )}
        </div>
    );
}
