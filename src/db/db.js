import Dexie from 'dexie';

export const db = new Dexie('KasiLocalDB');

db.version(1).stores({
  invoices: 'id, reference, status, total_amount, date_issued, due_date, customer_id', 
  customers: 'id, name, email, phone',
  syncQueue: '++id, action, payload, status, created_at' // ++id means auto-incrementing primary key
});

export const addInvoiceToLocal = async (invoice) => {
  return await db.invoices.put(invoice);
};

export const getLocalInvoices = async () => {
  return await db.invoices.toArray();
};

export const addCustomerToLocal = async (customer) => {
  return await db.customers.put(customer);
};

export const getLocalCustomers = async () => {
  return await db.customers.toArray();
};

export const addToSyncQueue = async (action, payload) => {
  return await db.syncQueue.add({
    action,
    payload,
    status: 'pending',
    created_at: new Date().toISOString()
  });
};

export const getPendingSyncTasks = async () => {
  return await db.syncQueue.where('status').equals('pending').toArray();
};

export const markSyncTaskCompleted = async (id) => {
  return await db.syncQueue.update(id, { status: 'completed' });
};
