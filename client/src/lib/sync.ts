import { storage, getSyncQueue, clearSyncItem } from './storage';
import api from './axios';

export const syncData = async () => {
    const queue = await getSyncQueue();

    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} items...`);

    for (const item of queue) {
        try {
            if (item.type === 'CREATE_SALE') {
                await api.post('/sales', item.data);
                // Remove from offline sales storage if needed, or just mark as synced
                await storage.sales.removeItem(item.id);
            }

            // Remove from queue after successful sync
            await clearSyncItem(item.id);
        } catch (error) {
            console.error('Failed to sync item:', item, error);
            // Keep in queue to retry later
        }
    }
};

export const cacheProducts = async (products: any[]) => {
    await storage.products.clear();
    for (const product of products) {
        await storage.products.setItem(product.id, product);
    }
};

export const getOfflineProducts = async () => {
    const products: any[] = [];
    await storage.products.iterate((value) => {
        products.push(value);
    });
    return products;
};
