
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@pos.com' },
            include: { store: true }
        });

        if (user) {
            console.log(`User: ${user.email}`);
            console.log(`Store ID: ${user.storeId}`);
            console.log(`Store Name: ${user.store?.name}`);
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
