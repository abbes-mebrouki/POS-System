import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing purchase flow...');

    // 1. Get Store and User
    const store = await prisma.store.findUnique({ where: { id: 'default-store' } });
    const cashier = await prisma.user.findUnique({ where: { email: 'cashier@pos.com' } });

    if (!store || !cashier) {
        console.error('Store or Cashier not found. Run seeds first.');
        return;
    }

    // 2. Get a product to buy
    const productSku = 'PROD-001'; // Apple
    const product = await prisma.product.findUnique({ where: { sku: productSku } });

    if (!product) {
        console.error(`Product ${productSku} not found.`);
        return;
    }

    console.log(`Initial Stock for ${product.name}: ${product.stockLevel}`);

    const purchaseQuantity = 5;

    if (product.stockLevel < purchaseQuantity) {
        console.error('Insufficient stock for test.');
        return;
    }

    // 3. Create Sale (Simulating the logic from sale.controller.ts)
    // In a real integration test we might call the API, but here we test the logic via Prisma directly 
    // or we can simulate the controller logic if we extracted it to a service. 
    // For this script, I will replicate the transaction logic to verify it works as expected against the DB.

    const total = Number(product.price) * purchaseQuantity;

    console.log(`Creating sale for ${purchaseQuantity} x ${product.name} at ${product.price} each. Total: ${total}`);

    try {
        const sale = await prisma.$transaction(async (tx) => {
            // Create Sale
            const newSale = await tx.sale.create({
                data: {
                    storeId: store.id,
                    userId: cashier.id,
                    total: total,
                    taxTotal: 0, // Simplified
                    paymentMethod: 'CASH',
                    status: 'COMPLETED',
                },
            });

            // Create Sale Line
            await tx.saleLine.create({
                data: {
                    saleId: newSale.id,
                    productId: product.id,
                    quantity: purchaseQuantity,
                    price: product.price,
                    discount: 0,
                },
            });

            // Decrement Stock
            await tx.product.update({
                where: { id: product.id },
                data: { stockLevel: { decrement: purchaseQuantity } },
            });

            // Inventory Transaction
            await tx.inventoryTransaction.create({
                data: {
                    productId: product.id,
                    quantity: purchaseQuantity,
                    type: 'OUT',
                    source: `Sale ${newSale.id}`,
                },
            });

            // Payment
            await tx.payment.create({
                data: {
                    saleId: newSale.id,
                    amount: total,
                    method: 'CASH',
                },
            });

            return newSale;
        });

        console.log(`Sale created successfully! ID: ${sale.id}`);

        // 4. Verify Stock
        const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
        console.log(`Updated Stock for ${product.name}: ${updatedProduct?.stockLevel}`);

        if (updatedProduct?.stockLevel === product.stockLevel - purchaseQuantity) {
            console.log('SUCCESS: Stock decremented correctly.');
        } else {
            console.error('FAILURE: Stock mismatch.');
        }

    } catch (error) {
        console.error('Error processing sale:', error);
    }
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
