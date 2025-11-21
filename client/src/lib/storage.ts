import localforage from 'localforage';

localforage.config({
    name: 'pos-system',
    storeName: 'pos_data',
    description: 'Offline storage for POS system'
});

export const storage = {
    products: localforage.createInstance({
        name: 'pos-system',
        storeName: 'products'
    }),
    sales: localforage.createInstance({
        name: 'pos-system',
        storeName: 'sales'
    }),
    syncQueue: localforage.createInstance({
        name: 'pos-system',
        storeName: 'sync_queue'
    })
};

export const saveOfflineSale = async (saleData: any) => {
    const id = crypto.randomUUID();
    await storage.sales.setItem(id, { ...saleData, offlineId: id, createdAt: new Date().toISOString() });
    await addToSyncQueue({ type: 'CREATE_SALE', data: saleData, id });
    return id;
};

export const addToSyncQueue = async (action: { type: string; data: any; id: string }) => {
    await storage.syncQueue.setItem(action.id, { ...action, timestamp: Date.now() });
};

export const getSyncQueue = async () => {
    const queue: any[] = [];
    await storage.syncQueue.iterate((value) => {
        queue.push(value);
    });
    return queue.sort((a, b) => a.timestamp - b.timestamp);
};

export const clearSyncItem = async (id: string) => {
    await storage.syncQueue.removeItem(id);
};
