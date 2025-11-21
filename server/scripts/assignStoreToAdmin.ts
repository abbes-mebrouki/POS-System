
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Find or Create Store
        let store = await prisma.store.findFirst();
        if (!store) {
            console.log('No store found, creating one...');
            store = await prisma.store.create({
                data: {
                    name: 'Main Store',
                    address: '123 Main St',
                    phone: '555-0123'
                }
            });
        }
        console.log(`Using Store: ${store.name} (${store.id})`);

        // 2. Update Admin User
        const user = await prisma.user.update({
            where: { email: 'admin@pos.com' },
            data: { storeId: store.id }
        });

        console.log(`Updated admin user with Store ID: ${user.storeId}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
