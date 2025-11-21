import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createSale = async (req: Request, res: Response) => {
    try {
        const { items, paymentMethod, customerId, storeId } = req.body;
        // @ts-ignore
        const userStoreId = req.user?.storeId;
        const userId = req.user?.id;
        const finalStoreId = userStoreId || storeId;

        if (!finalStoreId) {
            res.status(400).json({ error: 'Store ID is required' });
            return;
        }

        // Calculate totals
        let total = 0;
        let taxTotal = 0; // Simplified tax calculation for MVP

        // Verify stock and calculate total
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                res.status(400).json({ error: `Product ${item.productId} not found` });
                return;
            }
            if (product.stockLevel < item.quantity) {
                res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
                return;
            }
            total += item.price * item.quantity - (item.discount || 0);
        }

        // Transaction to ensure data integrity
        const sale = await prisma.$transaction(async (tx) => {
            // 1. Create Sale
            const newSale = await tx.sale.create({
                data: {
                    storeId: finalStoreId,
                    userId: userId!,
                    customerId,
                    total,
                    taxTotal,
                    paymentMethod,
                    status: 'COMPLETED',
                },
            });

            // 2. Create Sale Lines and Update Inventory
            for (const item of items) {
                await tx.saleLine.create({
                    data: {
                        saleId: newSale.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount || 0,
                    },
                });

                // Decrement stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockLevel: { decrement: item.quantity } },
                });

                // Record Inventory Transaction
                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        type: 'OUT',
                        source: `Sale ${newSale.id}`,
                    },
                });
            }

            // 3. Create Payment Record
            await tx.payment.create({
                data: {
                    saleId: newSale.id,
                    amount: total,
                    method: paymentMethod || 'CASH',
                },
            });

            return newSale;
        });

        const fullSale = await prisma.sale.findUnique({
            where: { id: sale.id },
            include: { items: { include: { product: true } }, payments: true },
        });

        res.status(201).json(fullSale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing sale' });
    }
};

export const getSales = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const storeId = req.user?.storeId;
        const sales = await prisma.sale.findMany({
            where: storeId ? { storeId } : undefined,
            include: { items: true, payments: true, user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
};

export const getSale = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sale = await prisma.sale.findUnique({
            where: { id },
            include: { items: { include: { product: true } }, payments: true, customer: true },
        });
        if (!sale) {
            res.status(404).json({ error: 'Sale not found' });
            return;
        }
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sale' });
    }
};
export const getSalesByUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        // @ts-ignore
        const storeId = req.user?.storeId;

        const sales = await prisma.sale.findMany({
            where: {
                userId,
                ...(storeId ? { storeId } : {}),
            },
            include: { items: { include: { product: true } }, payments: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user sales' });
    }
};
