import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customers' });
    }
};

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: { sales: true },
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customer' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone } = req.body;
        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
            },
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error creating customer' });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const customer = await prisma.customer.update({
            where: { id },
            data,
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error updating customer' });
    }
};
