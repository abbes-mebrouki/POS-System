/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding products...');

    const store = await prisma.store.findUnique({
        where: { id: 'default-store' },
    });

    if (!store) {
        console.error('Default store not found. Please run the main seed script first.');
        return;
    }

    const products = [
        {
            sku: 'PROD-001',
            name: 'Apple',
            description: 'Fresh Red Apple',
            price: 1.50,
            costPrice: 0.80,
            taxCode: 'TAX001',
            unit: 'kg',
            barcode: '10000001',
            stockLevel: 100,
            categoryId: 'FRUIT',
        },
        {
            sku: 'PROD-002',
            name: 'Banana',
            description: 'Ripe Yellow Banana',
            price: 0.90,
            costPrice: 0.40,
            taxCode: 'TAX001',
            unit: 'kg',
            barcode: '10000002',
            stockLevel: 150,
            categoryId: 'FRUIT',
        },
        {
            sku: 'PROD-003',
            name: 'Orange Juice',
            description: '1L Orange Juice Bottle',
            price: 3.50,
            costPrice: 2.00,
            taxCode: 'TAX002',
            unit: 'bottle',
            barcode: '10000003',
            stockLevel: 50,
            categoryId: 'BEVERAGE',
        },
        {
            sku: 'PROD-004',
            name: 'Milk',
            description: '1L Whole Milk',
            price: 2.00,
            costPrice: 1.20,
            taxCode: 'TAX002',
            unit: 'bottle',
            barcode: '10000004',
            stockLevel: 60,
            categoryId: 'DAIRY',
        },
        {
            sku: 'PROD-005',
            name: 'Bread',
            description: 'Whole Wheat Bread Loaf',
            price: 2.50,
            costPrice: 1.00,
            taxCode: 'TAX001',
            unit: 'loaf',
            barcode: '10000005',
            stockLevel: 40,
            categoryId: 'BAKERY',
        },
        {
            sku: 'PROD-006',
            name: 'Eggs',
            description: 'Dozen Large Eggs',
            price: 4.00,
            costPrice: 2.50,
            taxCode: 'TAX001',
            unit: 'carton',
            barcode: '10000006',
            stockLevel: 30,
            categoryId: 'DAIRY',
        },
        {
            sku: 'PROD-007',
            name: 'Chocolate Bar',
            description: 'Dark Chocolate 100g',
            price: 1.80,
            costPrice: 0.90,
            taxCode: 'TAX003',
            unit: 'bar',
            barcode: '10000007',
            stockLevel: 200,
            categoryId: 'SNACKS',
        },
        {
            sku: 'PROD-008',
            name: 'Potato Chips',
            description: 'Salted Potato Chips 150g',
            price: 2.20,
            costPrice: 1.10,
            taxCode: 'TAX003',
            unit: 'bag',
            barcode: '10000008',
            stockLevel: 80,
            categoryId: 'SNACKS',
        },
        {
            sku: 'PROD-009',
            name: 'Water',
            description: '500ml Still Water',
            price: 1.00,
            costPrice: 0.30,
            taxCode: 'TAX002',
            unit: 'bottle',
            barcode: '10000009',
            stockLevel: 300,
            categoryId: 'BEVERAGE',
        },
        {
            sku: 'PROD-010',
            name: 'Coffee Beans',
            description: '500g Arabica Coffee Beans',
            price: 12.00,
            costPrice: 7.00,
            taxCode: 'TAX002',
            unit: 'bag',
            barcode: '10000010',
            stockLevel: 25,
            categoryId: 'BEVERAGE',
        },
    ];

    for (const p of products) {
        const existing = await prisma.product.findUnique({
            where: { sku: p.sku },
        });

        if (!existing) {
            await prisma.product.create({
                data: {
                    ...p,
                    storeId: store.id,
                },
            });
            console.log(`Created product: ${p.name}`);
        } else {
            console.log(`Product already exists: ${p.name}`);
        }
    }

    console.log('Product seeding completed.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
