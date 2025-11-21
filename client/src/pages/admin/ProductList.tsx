import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Pencil } from 'lucide-react';

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    stockLevel: z.coerce.number().int().min(0, 'Stock must be positive'),
    storeId: z.string().optional(), // Optional because backend might handle it or we need to select it
});

export default function ProductList() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data;
        },
    });

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: '',
            sku: '',
            price: 0,
            stockLevel: 0,
        },
    });

    const createProduct = useMutation({
        mutationFn: async (values: z.infer<typeof productSchema>) => {
            // Using the default store ID from our seed data
            const res = await api.post('/products', { ...values, storeId: 'default-store' });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            console.error('Product creation error:', error);
            alert(`Failed to create product: ${error.response?.data?.error || error.message}`);
        },
    });

    const updateProduct = useMutation({
        mutationFn: async (values: z.infer<typeof productSchema>) => {
            const res = await api.put(`/products/${editingProduct.id}`, values);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsOpen(false);
            setEditingProduct(null);
            form.reset();
        },
        onError: (error: any) => {
            console.error('Product update error:', error);
            alert(`Failed to update product: ${error.response?.data?.error || error.message}`);
        },
    });

    function onSubmit(values: z.infer<typeof productSchema>) {
        if (editingProduct) {
            updateProduct.mutate(values);
        } else {
            createProduct.mutate(values);
        }
    }

    useEffect(() => {
        if (isOpen) {
            if (editingProduct) {
                form.reset({
                    name: editingProduct.name,
                    sku: editingProduct.sku,
                    price: Number(editingProduct.price),
                    stockLevel: editingProduct.stockLevel,
                });
            } else {
                form.reset({
                    name: '',
                    sku: '',
                    price: 0,
                    stockLevel: 0,
                });
            }
        }
    }, [isOpen, editingProduct, form]);

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Products</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAdd}>Add Product</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stockLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Stock</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} disabled={!!editingProduct} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {editingProduct && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Add Stock</label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const addAmount = parseInt(e.target.value) || 0;
                                                    const currentStock = editingProduct?.stockLevel || 0;
                                                    form.setValue('stockLevel', currentStock + addAmount);
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                New Total: {form.watch('stockLevel')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                                    {editingProduct
                                        ? (updateProduct.isPending ? 'Updating...' : 'Update Product')
                                        : (createProduct.isPending ? 'Creating...' : 'Create Product')
                                    }
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : (
                            products?.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.stockLevel}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
