
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting verification...');

        // 1. Get Product and Store Info
        const product = await prisma.product.findFirst({
            where: { name: 'Wireless Mouse' }
        });

        if (!product) {
            throw new Error('Product "Wireless Mouse" not found');
        }

        const initialStock = product.stockLevel;
        console.log(`Initial Stock: ${initialStock}`);

        const user = await prisma.user.findUnique({
            where: { email: 'admin@pos.com' }
        });

        if (!user) {
            throw new Error('Admin user not found');
        }

        // 2. Login to get token
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@pos.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        // const storeId = loginData.user.storeId; 

        console.log(`Logged in successfully. Store ID from response: ${loginData.user.storeId}`);

        // 3. Create Sale via API
        // IMPORTANT: We do NOT send storeId here, relying on the backend to extract it from the token
        console.log('Creating sale (relying on token for storeId)...');
        const saleRes = await fetch('http://localhost:3000/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                // storeId: storeId, // Commented out to simulate frontend behavior
                items: [
                    {
                        productId: product.id,
                        quantity: 1,
                        price: Number(product.price)
                    }
                ],
                paymentMethod: 'CASH'
            })
        });

        if (!saleRes.ok) {
            const err = await saleRes.text();
            console.error(`Sale creation failed with status ${saleRes.status}. Response body: ${err}`);
            throw new Error(`Sale creation failed: ${saleRes.status} ${err}`);
        }

        console.log('Sale created successfully.');

        // 4. Check Stock Again
        const updatedProduct = await prisma.product.findUnique({
            where: { id: product.id }
        });

        if (!updatedProduct) {
            throw new Error('Product not found after sale');
        }

        const finalStock = updatedProduct.stockLevel;
        console.log(`Final Stock: ${finalStock}`);

        if (finalStock === initialStock - 1) {
            console.log('SUCCESS: Stock decremented correctly.');
        } else {
            console.error(`FAILURE: Stock did not decrement correctly. Expected ${initialStock - 1}, got ${finalStock}`);
            process.exit(1);
        }

    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
