import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getProducts = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const storeId = req.user?.storeId;

        const products = await prisma.product.findMany({
            where: storeId ? { storeId } : undefined,
            include: { store: true },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { sku, name, price, costPrice, taxCode, unit, barcode, stockLevel, categoryId, storeId } = req.body;

        // @ts-ignore
        const userStoreId = req.user?.storeId;
        const finalStoreId = userStoreId || storeId;

        if (!finalStoreId) {
            res.status(400).json({ error: 'Store ID is required' });
            return;
        }

        const product = await prisma.product.create({
            data: {
                sku,
                name,
                price,
                costPrice,
                taxCode,
                unit,
                barcode,
                stockLevel: stockLevel || 0,
                categoryId,
                storeId: finalStoreId,
            },
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Error creating product', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const product = await prisma.product.update({
            where: { id },
            data,
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id },
        });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};
