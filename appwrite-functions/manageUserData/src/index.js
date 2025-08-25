const { Client, Databases, Query, Storage, Users } = require('node-appwrite');

async function getAllUserDocuments(databases, databaseId, collectionId, userId, log, error) {
    let documents = [];
    let cursor = null;

    if (!collectionId) {
        error(`getAllUserDocuments was called with an invalid collectionId.`);
        return [];
    }

    try {
        do {
            const queries = [Query.equal('userId', userId), Query.limit(100)];
            if (cursor) {
                queries.push(Query.cursorAfter(cursor));
            }
            const response = await databases.listDocuments(databaseId, collectionId, queries);
            if (response.documents.length > 0) {
                documents.push(...response.documents);
                cursor = response.documents[response.documents.length - 1].$id;
            } else {
                cursor = null;
            }
        } while (cursor);
    } catch (e) {
        error(`Failed to list documents for collection '${collectionId}'. Error: ${e.message}. This might be due to a missing 'userId' index or incorrect permissions.`);
    }
    return documents;
}

async function deleteAllUserDocuments(databases, databaseId, collectionId, userId, log, error) {
    if (!collectionId) {
        error(`deleteAllUserDocuments was called with an invalid collectionId.`);
        return;
    }
    try {
        let documents;
        let cursor = null;
        do {
            const queries = [Query.equal('userId', userId), Query.limit(25)];
            if (cursor) {
                queries.push(Query.cursorAfter(cursor));
            }
            documents = await databases.listDocuments(databaseId, collectionId, queries);
            
            if (documents.documents.length > 0) {
                await Promise.all(documents.documents.map(doc => 
                    databases.deleteDocument(databaseId, collectionId, doc.$id)
                ));
                cursor = documents.documents[documents.documents.length - 1].$id;
            } else {
                cursor = null;
            }
        } while (cursor);
        log(`Cleared documents for user ${userId} from ${collectionId}`);
    } catch (e) {
        error(`Failed to delete documents from collection '${collectionId}'. Error: ${e.message}`);
    }
}

async function deleteAllUserFiles(storage, bucketId, userId, log, error) {
    if (!bucketId) {
        error(`deleteAllUserFiles was called with an invalid bucketId.`);
        return;
    }
    try {
        let files;
        let cursor = null;
        do {
            const queries = [Query.limit(25)];
            if (cursor) {
                queries.push(Query.cursorAfter(cursor));
            }
            files = await storage.listFiles(bucketId, queries);
            
           if (files.files.length > 0) {
    const userFiles = files.files.filter(file => 
        file.permissions.some(p => p.includes(`user:${userId}`))
    );

    if (userFiles.length > 0) {
        await Promise.all(userFiles.map(file => 
            storage.deleteFile(bucketId, file.$id)
        ));
    }
    
    // Set cursor based on the last file fetched in the batch, not the last user file.
    cursor = files.files[files.files.length - 1].$id;
} else {
    cursor = null;
}
        } while (cursor);
        log(`Cleared files for user ${userId} from ${bucketId}`);
    } catch (e) {
        error(`Failed to delete files from bucket '${bucketId}'. Error: ${e.message}`);
    }
}

module.exports = async ({ req, res, log, error }) => {
    const requiredEnv = [
        'APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY_MANAGE_USER_SCOPE',
        'APPWRITE_DATABASE_ID', 'PROFILES_COLLECTION_ID', 'APPOINTMENTS_COLLECTION_ID',
        'MEDICAL_DOCUMENTS_COLLECTION_ID', 'BP_COLLECTION_ID', 'SUGAR_COLLECTION_ID',
        'WEIGHT_COLLECTION_ID', 'MEDS_COLLECTION_ID', 'CHAT_HISTORY_COLLECTION_ID',
        'BOOKMARKS_COLLECTION_ID', 'BLOODWORKS_COLLECTION_ID', 'FORUM_TOPICS_COLLECTION_ID',
        'FORUM_POSTS_COLLECTION_ID', 'FORUM_VOTES_COLLECTION_ID', 'PROFILE_BUCKET_ID',
        'MEDICAL_BUCKET_ID', 'CHAT_IMAGES_BUCKET_ID'
    ];
    const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);
    if (missingEnv.length > 0) {
        const errorMessage = `Function is missing required environment variables: ${missingEnv.join(', ')}. Please configure them in your Appwrite function settings.`;
        error(errorMessage);
        return res.send(JSON.stringify({ success: false, error: errorMessage }), 500, { 'Content-Type': 'application/json' });
    }

    const userId = req.headers['x-appwrite-user-id'];
    if (!userId) {
        error('User is not authenticated.');
        return res.send(JSON.stringify({ success: false, error: 'Authentication required.' }), 401, { 'Content-Type': 'application/json' });
    }

    let action;
    try {
        action = JSON.parse(req.body || '{}').action;
    } catch (e) {
        error('Invalid JSON body.');
        return res.send(JSON.stringify({ success: false, error: 'Invalid request body.' }), 400, { 'Content-Type': 'application/json' });
    }

    if (!action || !['export', 'delete'].includes(action)) {
        error(`Invalid or missing action: '${action}'`);
        return res.send(JSON.stringify({ success: false, error: 'Action ("export" or "delete") must be specified.' }), 400, { 'Content-Type': 'application/json' });
    }

    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY_MANAGE_USER_SCOPE);

    const databases = new Databases(client);
    const storage = new Storage(client);
    const users = new Users(client);
    const databaseId = process.env.APPWRITE_DATABASE_ID;

    switch (action) {
        case 'export':
            try {
                log(`Starting data EXPORT for user: ${userId}`);
                const collectionsToExport = {
                    profile: process.env.PROFILES_COLLECTION_ID,
                    appointments: process.env.APPOINTMENTS_COLLECTION_ID,
                    medicalDocuments: process.env.MEDICAL_DOCUMENTS_COLLECTION_ID,
                    bloodPressureReadings: process.env.BP_COLLECTION_ID,
                    bloodSugarReadings: process.env.SUGAR_COLLECTION_ID,
                    weightReadings: process.env.WEIGHT_COLLECTION_ID,
                    medicationReminders: process.env.MEDS_COLLECTION_ID,
                    chatHistory: process.env.CHAT_HISTORY_COLLECTION_ID,
                    bookmarks: process.env.BOOKMARKS_COLLECTION_ID,
                    bloodworkReports: process.env.BLOODWORKS_COLLECTION_ID,
                    forumTopics: process.env.FORUM_TOPICS_COLLECTION_ID,
                    forumPosts: process.env.FORUM_POSTS_COLLECTION_ID,
                    forumVotes: process.env.FORUM_VOTES_COLLECTION_ID,
                };

                const exportPromises = Object.entries(collectionsToExport).map(async ([key, collectionId]) => {
                    const documents = await getAllUserDocuments(databases, databaseId, collectionId, userId, log, error);
                    return { key, documents };
                });

                const results = await Promise.all(exportPromises);
                
                const userData = {};
                results.forEach(({ key, documents }) => {
                    if (documents.length > 0) {
                        userData[key] = documents;
                    }
                });

                log(`Data export complete for user: ${userId}. Found data in ${Object.keys(userData).length} collection(s).`);
                
                const responseBody = JSON.stringify(userData, null, 2);
                return res.send(responseBody, 200, {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="mamasaheli_data_${userId}.json"`
                });

            } catch (err) {
                error(`A critical error occurred during data export for user ${userId}: ${err.message}`);
                return res.send(JSON.stringify({ success: false, error: 'Failed to export data due to a server error.' }), 500, { 'Content-Type': 'application/json' });
            }

        case 'delete':
            try {
                log(`Starting DELETION process for user: ${userId}`);
                const collectionsToClear = [
                    process.env.PROFILES_COLLECTION_ID, process.env.APPOINTMENTS_COLLECTION_ID,
                    process.env.MEDICAL_DOCUMENTS_COLLECTION_ID, process.env.BP_COLLECTION_ID,
                    process.env.SUGAR_COLLECTION_ID, process.env.WEIGHT_COLLECTION_ID,
                    process.env.MEDS_COLLECTION_ID, process.env.CHAT_HISTORY_COLLECTION_ID,
                    process.env.BOOKMARKS_COLLECTION_ID, process.env.BLOODWORKS_COLLECTION_ID,
                    process.env.FORUM_TOPICS_COLLECTION_ID, process.env.FORUM_POSTS_COLLECTION_ID,
                    process.env.FORUM_VOTES_COLLECTION_ID,
                ];
                
                const bucketsToClear = [
                    process.env.PROFILE_BUCKET_ID, process.env.MEDICAL_BUCKET_ID, process.env.CHAT_IMAGES_BUCKET_ID,
                ];

                const deletionPromises = [
                    ...collectionsToClear.map(id => deleteAllUserDocuments(databases, databaseId, id, userId, log, error)),
                    ...bucketsToClear.map(id => deleteAllUserFiles(storage, id, userId, log, error))
                ];

                await Promise.all(deletionPromises);
                
                await users.delete(userId);
                log(`SUCCESS: Permanently deleted user account: ${userId}`);
                return res.send(JSON.stringify({ success: true, message: 'Account and all data permanently deleted.' }), 200, { 'Content-Type': 'application/json' });
            } catch (err) {
                error(`CRITICAL ERROR during deletion for user ${userId}: ${err.message}`);
                return res.send(JSON.stringify({ success: false, error: 'Failed to completely delete account. Please contact support.' }), 500, { 'Content-Type': 'application/json' });
            }
    }
};