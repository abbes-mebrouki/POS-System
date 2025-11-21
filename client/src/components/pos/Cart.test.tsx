import { render, screen, fireEvent } from '@testing-library/react';
import Cart from './Cart';
import { describe, it, expect, vi } from 'vitest';

describe('Cart Component', () => {
    const mockItems = [
        {
            product: { id: '1', name: 'Test Product', price: 10, stockLevel: 100 },
            quantity: 2,
        },
    ];

    it('renders cart items correctly', () => {
        render(
            <Cart
                items={mockItems}
                onUpdateQuantity={vi.fn()}
                onRemove={vi.fn()}
                onClear={vi.fn()}
                onCheckout={vi.fn()}
            />
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$10.00 x 2')).toBeInTheDocument();
        expect(screen.getByText('$20.00')).toBeInTheDocument(); // Total
    });

    it('calls onCheckout when checkout button is clicked', () => {
        const handleCheckout = vi.fn();
        render(
            <Cart
                items={mockItems}
                onUpdateQuantity={vi.fn()}
                onRemove={vi.fn()}
                onClear={vi.fn()}
                onCheckout={handleCheckout}
            />
        );

        fireEvent.click(screen.getByText('Checkout'));
        expect(handleCheckout).toHaveBeenCalled();
    });

    it('disables checkout button when cart is empty', () => {
        render(
            <Cart
                items={[]}
                onUpdateQuantity={vi.fn()}
                onRemove={vi.fn()}
                onClear={vi.fn()}
                onCheckout={vi.fn()}
            />
        );

        expect(screen.getByText('Checkout')).toBeDisabled();
    });
});
