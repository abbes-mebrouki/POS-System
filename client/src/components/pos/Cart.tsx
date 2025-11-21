import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Product {
    id: string;
    name: string;
    price: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartProps {
    items: CartItem[];
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
    onCheckout: () => void;
    isProcessing?: boolean;
}

export default function Cart({ items, onUpdateQuantity, onRemove, onClear, onCheckout, isProcessing = false }: CartProps) {
    const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const tax = subtotal * 0.1; // Example tax
    const total = subtotal + tax;

    return (
        <div className="flex flex-col h-full bg-white">
            <ScrollArea className="flex-1 p-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">Your cart is empty</p>
                        <p className="text-sm text-center max-w-[200px]">
                            Select products from the grid to add them to the sale.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.product.id} className="flex gap-4 group">
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 font-bold text-gray-400">
                                    {item.product.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium truncate pr-2">{item.product.name}</h3>
                                        <p className="font-semibold">
                                            ${(Number(item.product.price) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        ${Number(item.product.price).toFixed(2)} each
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border rounded-md bg-gray-50">
                                            <button
                                                className="h-7 w-7 flex items-center justify-center hover:bg-gray-200 rounded-l-md transition-colors"
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                className="h-7 w-7 flex items-center justify-center hover:bg-gray-200 rounded-r-md transition-colors"
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
                                            onClick={() => onRemove(item.product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-6 bg-gray-50 border-t space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Tax (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <Button
                        variant="outline"
                        onClick={onClear}
                        disabled={items.length === 0 || isProcessing}
                        className="col-span-1 h-12 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={onCheckout}
                        disabled={items.length === 0 || isProcessing}
                        className="col-span-3 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                Checkout <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
