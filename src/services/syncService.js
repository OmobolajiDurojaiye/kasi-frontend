import api from '../api/axios';
import { getPendingSyncTasks, markSyncTaskCompleted } from '../db/db';

class SyncService {
    static async flushQueue() {
        if (!navigator.onLine) return; // double check

        try {
            const pendingTasks = await getPendingSyncTasks();
            
            if (pendingTasks.length === 0) return;

            console.log(`[SyncService] Found ${pendingTasks.length} pending tasks to sync.`);

            for (const task of pendingTasks) {
                try {
                    console.log(`[SyncService] Processing task ID: ${task.id} - Action: ${task.action}`);
                    
                    if (task.action === 'CREATE_INVOICE') {
                        // The id we generated was local (Date.now()), the server will create its own real ID
                        // Let's strip the local ID out so it doesn't mess up the POST payload
                        const { id, ...cleanPayload } = task.payload; 
                        
                        await api.post('/api/invoices/', cleanPayload);
                    }
                    
                    // Add other actions here later if needed (e.g. UPDATE_CUSTOMER)

                    // Mark as completed in IndexedDB
                    await markSyncTaskCompleted(task.id);
                    console.log(`[SyncService] Successfully synced task ID: ${task.id}`);

                } catch (error) {
                    console.error(`[SyncService] Failed to sync task ID: ${task.id}`, error);
                    // If it's a hard error (e.g. 400 Bad Request), we might want to mark it as failed instead of pending forever.
                    // But for now, leave it pending so it retries on the next flush.
                }
            }
        } catch (error) {
           console.error("[SyncService] Error during flushQueue operation:", error);
        }
    }
}

export default SyncService;
