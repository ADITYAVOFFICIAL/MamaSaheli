// Update a bloodwork entry in Appwrite by document ID
// Usage: Pass documentId and newResultsArr (array of biomarker objects)

const sdk = require('node-appwrite');

module.exports = async function (req, res) {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const database = new sdk.Databases(client);
    const { documentId, newResultsArr } = req.body;
    if (!documentId || !Array.isArray(newResultsArr)) {
        return res.json({ success: false, error: 'Missing documentId or newResultsArr' });
    }
    try {
        // Replace 'bloodworkCollectionId' with your actual collection ID
        const bloodworkCollectionId = process.env.BLOODWORK_COLLECTION_ID;
        await database.updateDocument(
            bloodworkCollectionId,
            documentId,
            { results: JSON.stringify(newResultsArr) }
        );
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, error: error.message });
    }
};
