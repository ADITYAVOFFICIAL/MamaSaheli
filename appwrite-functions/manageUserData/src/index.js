const sdk = require('node-appwrite');

// --- Helper Functions (Shared Logic) ---

// Fetches all documents for a user from a collection, handling pagination
async function getAllUserDocuments(databases, collectionId, userId) {
    let documents = [];
    let offset = 0;
    const limit = 100;
    let response;
    do {
        try {
            response = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                [sdk.Query.equal('userId', userId), sdk.Query.limit(limit), sdk.Query.offset(offset)]
            );
            documents.push(...response.documents);
            offset += limit;
        } catch (e) {
            // Ignore errors for collections that might not exist or have no user docs
            break;
        }
    } while (response && response.documents.length >= limit);
    return documents;
}

// Deletes all documents for a user from a collection
async function deleteAllUserDocuments(databases, collectionId, userId, log) {
    let documents;
    do {
        try {
            documents = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                [sdk.Query.equal('userId', userId), sdk.Query.limit(100)]
            );
            for (const doc of documents.documents) {
                await databases.deleteDocument(process.env.APPWRITE_DATABASE_ID, collectionId, doc.$id);
            }
        } catch (e) {
            break;
        }
    } while (documents && documents.documents.length > 0);
    log(`Cleared documents for user ${userId} from ${collectionId}`);
}

// Deletes all files for a user from a bucket
async function deleteAllUserFiles(storage, bucketId, userId, log) {
    let files;
    do {
        try {
            files = await storage.listFiles(bucketId, [sdk.Query.limit(100)]);
            const userFiles = files.files.filter(file =>
                file.permissions.some(p => p.startsWith(`read("user:${userId}")`) || p.startsWith(`write("user:${userId}")`))
            );
            for (const file of userFiles) {
                await storage.deleteFile(bucketId, file.$id);
            }
        } catch (e) {
            break;
        }
    } while (files && files.files.length > 0);
    log(`Cleared files for user ${userId} from ${bucketId}`);
}


// --- Main Function Logic ---

module.exports = async ({ req, res, log, error }) => {
    const userId = req.headers['x-appwrite-user-id'];

    if (!userId) {
        error('User is not authenticated.');
        return res.json({ success: false, error: 'Authentication required.' }, 401);
    }

    // Parse the action from the request body
    let action;
    try {
        const body = JSON.parse(req.body || '{}');
        action = body.action;
    } catch (e) {
        error('Invalid JSON body.');
        return res.json({ success: false, error: 'Invalid request body.' }, 400);
    }

    if (!action) {
        error('Action not specified.');
        return res.json({ success: false, error: 'Action (e.g., "export", "delete") must be specified.' }, 400);
    }

    // --- CRITICAL: Initialize the Appwrite client with a powerful API key ---
    // This key must have scopes for reading/writing all user data and deleting users.
    const client = new sdk.Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY_MANAGE_USER_SCOPE); // Use a dedicated, powerful key

    const databases = new sdk.Databases(client);
    const storage = new sdk.Storage(client);
    const users = new sdk.Users(client);

    // --- Action Switch ---
    switch (action) {
        case 'export':
            try {
                log(`Starting data EXPORT for user: ${userId}`);
                const collectionsToExport = [
                    process.env.PROFILES_COLLECTION_ID, process.env.APPOINTMENTS_COLLECTION_ID,
                    process.env.MEDICAL_DOCUMENTS_COLLECTION_ID, process.env.BP_COLLECTION_ID,
                    process.env.SUGAR_COLLECTION_ID, process.env.WEIGHT_COLLECTION_ID,
                    process.env.MEDS_COLLECTION_ID, process.env.CHAT_HISTORY_COLLECTION_ID,
                    process.env.BOOKMARKS_COLLECTION_ID, process.env.BLOODWORKS_COLLECTION_ID,
                    process.env.FORUM_TOPICS_COLLECTION_ID, process.env.FORUM_POSTS_COLLECTION_ID,
                    process.env.FORUM_VOTES_COLLECTION_ID,
                ];
                const userData = {};
                for (const collectionId of collectionsToExport) {
                    if (collectionId) {
                        const collectionName = collectionId.replace(/s$/, '');
                        userData[collectionName] = await getAllUserDocuments(databases, collectionId, userId);
                    }
                }
                log(`Data export complete for user: ${userId}`);
                return res.json(userData, 200, {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="mamasaheli_data_${userId}.json"`
                });
            } catch (err) {
                error(`Error during data export for user ${userId}: ${err.message}`);
                return res.json({ success: false, error: 'Failed to export data.' }, 500);
            }

        case 'delete':
            try {
                log(`Starting DELETION process for user: ${userId}`);
                // 1. Delete database documents
                const collectionsToClear = [
                    process.env.PROFILES_COLLECTION_ID, process.env.APPOINTMENTS_COLLECTION_ID,
                    process.env.MEDICAL_DOCUMENTS_COLLECTION_ID, process.env.BP_COLLECTION_ID,
                    process.env.SUGAR_COLLECTION_ID, process.env.WEIGHT_COLLECTION_ID,
                    process.env.MEDS_COLLECTION_ID, process.env.CHAT_HISTORY_COLLECTION_ID,
                    process.env.BOOKMARKS_COLLECTION_ID, process.env.BLOODWORKS_COLLECTION_ID,
                    process.env.FORUM_TOPICS_COLLECTION_ID, process.env.FORUM_POSTS_COLLECTION_ID,
                    process.env.FORUM_VOTES_COLLECTION_ID,
                ];
                for (const collectionId of collectionsToClear) {
                    if (collectionId) await deleteAllUserDocuments(databases, collectionId, userId, log);
                }
                // 2. Delete storage files
                const bucketsToClear = [
                    process.env.PROFILE_BUCKET_ID, process.env.MEDICAL_BUCKET_ID, process.env.CHAT_IMAGES_BUCKET_ID,
                ];
                for (const bucketId of bucketsToClear) {
                    if (bucketId) await deleteAllUserFiles(storage, bucketId, userId, log);
                }
                // 3. Delete the user account itself
                await users.delete(userId);
                log(`SUCCESS: Permanently deleted user account: ${userId}`);
                return res.json({ success: true, message: 'Account and all data permanently deleted.' });
            } catch (err) {
                error(`CRITICAL ERROR during deletion for user ${userId}: ${err.message}`);
                return res.json({ success: false, error: 'Failed to completely delete account. Please contact support.' }, 500);
            }

        default:
            error(`Invalid action '${action}' requested by user ${userId}.`);
            return res.json({ success: false, error: 'Invalid action specified.' }, 400);
    }
};