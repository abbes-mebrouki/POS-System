import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    stockLevel: number;
    category?: string;
}

interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
                <Card
                    key={product.id}
                    className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white"
                >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-300 select-none">
                            {product.name.charAt(0)}
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>

                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold truncate pr-2" title={product.name}>
                                {product.name}
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-primary">
                                ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                / unit
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <div className={`w-2 h-2 rounded-full ${product.stockLevel > 10 ? 'bg-green-500' : product.stockLevel > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            {product.stockLevel} in stock
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                        <Button
                            className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            size="sm"
                            onClick={() => onAddToCart(product)}
                            disabled={product.stockLevel <= 0}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
