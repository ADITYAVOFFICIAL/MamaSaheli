// src/utils/appwriteConfig.ts
export const appwriteEnvConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'YOUR_PROJECT_ID',
  databaseId: import.meta.env.VITE_APPWRITE_BLOG_DATABASE_ID || 'YOUR_DATABASE_ID',

  profilesCollectionId: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || 'profiles',
  appointmentsCollectionId: import.meta.env.VITE_APPWRITE_APPOINTMENTS_COLLECTION_ID || 'appointments',
  medicalDocumentsCollectionId: import.meta.env.VITE_APPWRITE_MEDICAL_DOCUMENTS_COLLECTION_ID || 'medicalDocuments',
  blogsCollectionId: import.meta.env.VITE_APPWRITE_BLOG_COLLECTION_ID || 'blogs',
  bpCollectionId: import.meta.env.VITE_APPWRITE_BP_COLLECTION_ID || 'bloodPressure',
  sugarCollectionId: import.meta.env.VITE_APPWRITE_SUGAR_COLLECTION_ID || 'bloodSugar',
  weightCollectionId: import.meta.env.VITE_APPWRITE_WEIGHT_COLLECTION_ID || 'weight',
  medsCollectionId: import.meta.env.VITE_APPWRITE_MEDS_COLLECTION_ID || 'medications',
  chatHistoryCollectionId: import.meta.env.VITE_APPWRITE_CHAT_HISTORY_COLLECTION_ID || 'chatHistory',
  bookmarksCollectionId: import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID || 'bookmarks',
  forumTopicsCollectionId: import.meta.env.VITE_APPWRITE_FORUM_TOPICS_COLLECTION_ID || 'forumTopics',
  forumPostsCollectionId: import.meta.env.VITE_APPWRITE_FORUM_POSTS_COLLECTION_ID || 'forumPosts',
  forumVotesCollectionId: import.meta.env.VITE_APPWRITE_FORUM_VOTES_COLLECTION_ID || 'forumVotes',
  bloodworksCollectionId: import.meta.env.VITE_BLOODWORKS_COLLECTION_ID || 'bloodworks',
  symptomLogsCollectionId: import.meta.env.VITE_APPWRITE_SYMPTOM_LOGS_COLLECTION_ID || 'symptomLogs',
  kickCounterCollectionId: import.meta.env.VITE_APPWRITE_KICK_COUNTER_COLLECTION_ID || 'kickCounterSessions',
  contractionSessionsCollectionId: import.meta.env.VITE_APPWRITE_CONTRACTION_SESSIONS_COLLECTION_ID || 'contractionSessions',
  weeklyPhotosCollectionId: import.meta.env.VITE_APPWRITE_WEEKLY_PHOTOS_COLLECTION_ID || 'weeklyPhotoLogs',
  doctorChatMessagesCollectionId: import.meta.env.VITE_APPWRITE_DRCHAT_KEY || 'doctorChatMessages',

  profileBucketId: import.meta.env.VITE_APPWRITE_PROFILE_BUCKET_ID || 'profilePhotos',
  medicalBucketId: import.meta.env.VITE_APPWRITE_MEDICAL_BUCKET_ID || 'medicalFiles',
  chatImagesBucketId: import.meta.env.VITE_APPWRITE_CHAT_IMAGES_BUCKET_ID || 'chatImages',
};

export const appwriteSchemaConfig = {
  databaseId: appwriteEnvConfig.databaseId,
  collections: {
    profiles: {
      id: appwriteEnvConfig.profilesCollectionId,
      name: 'User Profiles',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'name', type: 'string', required: false, size: 255, array: false },
        { key: 'email', type: 'email', required: false, size: 255, array: false },
        { key: 'age', type: 'integer', required: false, min: 0, max: 120, array: false },
        { key: 'gender', type: 'string', required: false, size: 50, array: false },
        { key: 'address', type: 'string', required: false, size: 1000, array: false },
        { key: 'phoneNumber', type: 'string', required: false, size: 50, array: false },
        { key: 'profilePhotoId', type: 'string', required: false, size: 255, array: false },
        { key: 'weeksPregnant', type: 'integer', required: false, min: 0, max: 45, array: false },
        { key: 'preExistingConditions', type: 'string', required: false, size: 2000, array: false },
        { key: 'previousPregnancies', type: 'integer', required: false, min: 0, max: 20, array: false },
        { key: 'deliveryPreference', type: 'string', required: false, size: 50, array: false },
        { key: 'partnerSupport', type: 'string', required: false, size: 100, array: false },
        { key: 'workSituation', type: 'string', required: false, size: 100, array: false },
        { key: 'dietaryPreferences', type: 'string', required: false, size: 100, array: true },
        { key: 'activityLevel', type: 'string', required: false, size: 50, array: false },
        { key: 'chatTonePreference', type: 'string', required: false, size: 50, array: false },
        { key: 'languagePreference', type: 'string', required: false, size: 10, array: false, default: 'en' },
        { key: 'hospitalId', type: 'string', required: false, size: 255, array: false },
        { key: 'hospitalName', type: 'string', required: false, size: 255, array: false },
        { key: 'assignedDoctorId', type: 'string', required: false, size: 255, array: false },
        { key: 'assignedDoctorName', type: 'string', required: false, size: 255, array: false },
        { key: 'lmpDate', type: 'datetime', required: false, array: false },
        { key: 'estimatedDueDate', type: 'datetime', required: false, array: false },
      ],
      indexes: [
        { key: 'userId_unique', type: 'unique', attributes: ['userId'], orders: ['ASC'] },
        { key: 'email_idx', type: 'key', attributes: ['email'], orders: ['ASC'] },
        { key: 'hospitalId_idx', type: 'key', attributes: ['hospitalId'], orders: ['ASC'] },
        { key: 'assignedDoctorId_idx', type: 'key', attributes: ['assignedDoctorId'], orders: ['ASC'] },
        { key: 'name_fulltext', type: 'fulltext', attributes: ['name'], orders: [] },
      ],
    },
    symptomLogs: {
      id: appwriteEnvConfig.symptomLogsCollectionId,
      name: 'Symptom Logs',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'symptoms', type: 'string', required: true, size: 255, array: true },
        { key: 'notes', type: 'string', required: false, size: 5000, array: false },
        { key: 'loggedAt', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_loggedAt_idx', type: 'key', attributes: ['userId', 'loggedAt'], orders: ['ASC', 'DESC'] },
      ],
    },
    kickCounterSessions: {
      id: appwriteEnvConfig.kickCounterCollectionId,
      name: 'Kick Counter Sessions',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'startTime', type: 'datetime', required: true, array: false },
        { key: 'endTime', type: 'datetime', required: true, array: false },
        { key: 'durationSeconds', type: 'integer', required: true, min: 0, array: false },
        { key: 'kickCount', type: 'integer', required: true, min: 0, array: false },
      ],
      indexes: [
        { key: 'userId_startTime_idx', type: 'key', attributes: ['userId', 'startTime'], orders: ['ASC', 'DESC'] },
      ],
    },
    contractionSessions: {
      id: appwriteEnvConfig.contractionSessionsCollectionId,
      name: 'Contraction Sessions',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'sessionDate', type: 'datetime', required: true, array: false },
        { key: 'contractions', type: 'string', required: true, size: 10000, array: false },
      ],
      indexes: [
        { key: 'userId_sessionDate_idx', type: 'key', attributes: ['userId', 'sessionDate'], orders: ['ASC', 'DESC'] },
      ],
    },
    weeklyPhotoLogs: {
      id: appwriteEnvConfig.weeklyPhotosCollectionId,
      name: 'Weekly Photo Logs',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'weekNumber', type: 'integer', required: true, min: 1, max: 42, array: false },
        { key: 'photoFileId', type: 'string', required: true, size: 255, array: false },
        { key: 'notes', type: 'string', required: false, size: 1000, array: false },
        { key: 'loggedAt', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_weekNumber_idx', type: 'key', attributes: ['userId', 'weekNumber'], orders: ['ASC', 'DESC'] },
      ],
    },
    doctorChatMessages: {
      id: appwriteEnvConfig.doctorChatMessagesCollectionId,
      name: 'Doctor Chat Messages',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'doctorId', type: 'string', required: true, size: 255, array: false },
        { key: 'sessionId', type: 'string', required: true, size: 255, array: false },
        { key: 'senderId', type: 'string', required: true, size: 255, array: false },
        { key: 'role', type: 'string', required: true, size: 10, array: false },
        { key: 'content', type: 'string', required: true, size: 65535, array: false },
        { key: 'timestamp', type: 'datetime', required: true, array: false },
        { key: 'isRead', type: 'boolean', required: false, default: false, array: false },
      ],
      indexes: [
        { key: 'userId_doctorId_timestamp_idx', type: 'key', attributes: ['userId', 'doctorId', 'timestamp'], orders: ['ASC', 'ASC', 'ASC'] },
        { key: 'sessionId_timestamp_idx', type: 'key', attributes: ['sessionId', 'timestamp'], orders: ['ASC', 'ASC'] },
      ],
    },
  },
  buckets: {
    profileBucket: {
      id: appwriteEnvConfig.profileBucketId,
      name: 'Profile Photos',
      maximumFileSize: 5242880,
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      permissions: ['user:{userId}'],
    },
    medicalBucket: {
      id: appwriteEnvConfig.medicalBucketId,
      name: 'Medical Documents',
      maximumFileSize: 10485760,
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt', 'heic', 'heif'],
      permissions: ['user:{userId}'],
    },
    chatImagesBucket: {
      id: appwriteEnvConfig.chatImagesBucketId,
      name: 'Chat Images',
      maximumFileSize: 5242880,
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
      permissions: ['user:{userId}'],
    },
  }
};

export default appwriteSchemaConfig;