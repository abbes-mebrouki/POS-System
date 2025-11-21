
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get a product
        const product = await prisma.product.findFirst({
            where: { stockLevel: { gt: 0 } }
        });

        if (!product) {
            console.log('No products with stock found');
            return;
        }

        console.log(`Initial Stock for ${product.name} (${product.id}): ${product.stockLevel}`);

        // 2. Simulate a sale (decrement stock)
        // We will manually call the update that the controller does
        // actually, let's just check the current stock, I will manually make a purchase in the browser
        // and then run this script again to see if it changed.

        // So this script just prints the stock of a specific product.
        // Let's hardcode the product ID I used before: MOUSE002 (Wireless Mouse)
        // I need to find its UUID first.

        const mouse = await prisma.product.findFirst({
            where: { name: 'Wireless Mouse' }
        });

        if (mouse) {
            console.log(`Stock for Wireless Mouse: ${mouse.stockLevel}`);
        } else {
            console.log('Wireless Mouse not found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
