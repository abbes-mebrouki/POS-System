import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create default store
    const store = await prisma.store.upsert({
        where: { id: 'default-store' },
        update: {},
        create: {
            id: 'default-store',
            name: 'Main Store',
            address: '123 Main St',
            phone: '+1234567890',
            currency: 'USD',
            timezone: 'UTC',
        },
    });

    // Admin User
    const adminEmail = 'admin@pos.com';
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            password: adminPassword,
            name: 'Admin User',
        },
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
            storeId: store.id,
        },
    });

    // Cashier User
    const cashierEmail = 'cashier@pos.com';
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await prisma.user.upsert({
        where: { email: cashierEmail },
        update: {},
        create: {
            email: cashierEmail,
            name: 'Cashier User',
            password: cashierPassword,
            role: 'CASHIER',
            storeId: store.id,
        },
    });

    console.log({ store, admin, cashier });
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
