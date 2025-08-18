export const appwriteEnvConfig = {
  endpoint: import.meta.env.VITE_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_PUBLIC_APPWRITE_PROJECT_ID || 'YOUR_PROJECT_ID',
  databaseId: import.meta.env.VITE_PUBLIC_APPWRITE_BLOG_DATABASE_ID || 'YOUR_DATABASE_ID',

  profilesCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID || 'profiles',
  appointmentsCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID || 'appointments',
  medicalDocumentsCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_MEDICAL_DOCUMENTS_COLLECTION_ID || 'medicalDocuments',
  blogsCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_BLOG_COLLECTION_ID || 'blogs',
  bpCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_BP_COLLECTION_ID || 'bloodPressure',
  sugarCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_SUGAR_COLLECTION_ID || 'bloodSugar',
  weightCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_WEIGHT_COLLECTION_ID || 'weight',
  medsCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_MEDS_COLLECTION_ID || 'medications',
  chatHistoryCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_CHAT_HISTORY_COLLECTION_ID || 'chatHistory',
  bookmarksCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID || 'bookmarks',
  forumTopicsCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_FORUM_TOPICS_COLLECTION_ID || 'forumTopics',
  forumPostsCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_FORUM_POSTS_COLLECTION_ID || 'forumPosts',
  forumVotesCollectionId: import.meta.env.VITE_PUBLIC_APPWRITE_FORUM_VOTES_COLLECTION_ID || 'forumVotes',
  bloodworksCollectionId: import.meta.env.VITE_PUBLIC_BLOODWORKS_COLLECTION_ID || 'bloodworks',

  profileBucketId: import.meta.env.VITE_PUBLIC_APPWRITE_PROFILE_BUCKET_ID || 'profilePhotos',
  medicalBucketId: import.meta.env.VITE_PUBLIC_APPWRITE_MEDICAL_BUCKET_ID || 'medicalFiles',
  chatImagesBucketId: import.meta.env.VITE_PUBLIC_APPWRITE_CHAT_IMAGES_BUCKET_ID || 'chatImages',
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
        { key: 'hospitalName', type: 'string', required: false, size: 255, array: false }
      ],
      indexes: [
        { key: 'userId_unique', type: 'unique', attributes: ['userId'], orders: ['ASC'] },
      ],
    },
    appointments: {
      id: appwriteEnvConfig.appointmentsCollectionId,
      name: 'User Appointments',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'date', type: 'datetime', required: true, array: false },
        { key: 'appointmentType', type: 'string', required: false, size: 100, array: false, default: 'General' },
        { key: 'notes', type: 'string', required: false, size: 2000, array: false },
        { key: 'isCompleted', type: 'boolean', required: false, default: false, array: false },
      ],
      indexes: [
        { key: 'userId_date_idx', type: 'key', attributes: ['userId', 'date'], orders: ['ASC', 'ASC'] },
        { key: 'userId_isCompleted_idx', type: 'key', attributes: ['userId', 'isCompleted'], orders: ['ASC', 'ASC'] },
      ],
    },
    medicalDocuments: {
      id: appwriteEnvConfig.medicalDocumentsCollectionId,
      name: 'Medical Documents',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'fileId', type: 'string', required: true, size: 255, array: false },
        { key: 'fileName', type: 'string', required: true, size: 255, array: false },
        { key: 'documentType', type: 'string', required: false, size: 255, array: false },
        { key: 'description', type: 'string', required: false, size: 1000, array: false },
      ],
      indexes: [
        { key: 'userId_idx', type: 'key', attributes: ['userId'], orders: ['ASC'] },
      ],
    },
    blogs: {
      id: appwriteEnvConfig.blogsCollectionId,
      name: 'Blog Posts',
      attributes: [
        { key: 'title', type: 'string', required: true, size: 255, array: false },
        { key: 'slug', type: 'string', required: true, size: 255, array: false },
        { key: 'content', type: 'string', required: true, size: 16777216, array: false },
        { key: 'author', type: 'string', required: true, size: 255, array: false },
        { key: 'category', type: 'string', required: false, size: 255, array: false },
        { key: 'imageUrl', type: 'string', required: false, size: 1024, array: false },
        { key: 'imageFileId', type: 'string', required: false, size: 255, array: false },
        { key: 'tags', type: 'string', required: false, size: 100, array: true },
        { key: 'publishedAt', type: 'datetime', required: false, array: false },
      ],
      indexes: [
        { key: 'slug_unique', type: 'unique', attributes: ['slug'], orders: ['ASC'] },
        { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
        { key: 'published_idx', type: 'key', attributes: ['publishedAt'], orders: ['DESC'] },
        { key: 'tags_idx', type: 'key', attributes: ['tags'], orders: [] },
        { key: 'title_fulltext', type: 'fulltext', attributes: ['title'], orders: [] },
      ],
    },
    bloodPressure: {
      id: appwriteEnvConfig.bpCollectionId,
      name: 'Blood Pressure Readings',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'systolic', type: 'integer', required: true, min: 0, max: 300, array: false },
        { key: 'diastolic', type: 'integer', required: true, min: 0, max: 200, array: false },
        { key: 'recordedAt', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_recordedAt_idx', type: 'key', attributes: ['userId', 'recordedAt'], orders: ['ASC', 'DESC'] },
      ],
    },
    bloodSugar: {
      id: appwriteEnvConfig.sugarCollectionId,
      name: 'Blood Sugar Readings',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'level', type: 'float', required: true, min: 0, max: 1000, array: false },
        { key: 'measurementType', type: 'string', required: true, size: 50, array: false },
        { key: 'recordedAt', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_recordedAt_idx', type: 'key', attributes: ['userId', 'recordedAt'], orders: ['ASC', 'DESC'] },
      ],
    },
    weight: {
      id: appwriteEnvConfig.weightCollectionId,
      name: 'Weight Readings',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'weight', type: 'float', required: true, min: 0, max: 500, array: false },
        { key: 'unit', type: 'string', required: true, size: 10, array: false },
        { key: 'recordedAt', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_recordedAt_idx', type: 'key', attributes: ['userId', 'recordedAt'], orders: ['ASC', 'DESC'] },
      ],
    },
    medications: {
      id: appwriteEnvConfig.medsCollectionId,
      name: 'Medication Reminders',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'medicationName', type: 'string', required: true, size: 255, array: false },
        { key: 'dosage', type: 'string', required: true, size: 100, array: false },
        { key: 'frequency', type: 'string', required: true, size: 100, array: false },
        { key: 'times', type: 'string', required: false, size: 20, array: true },
        { key: 'notes', type: 'string', required: false, size: 1000, array: false },
        { key: 'isActive', type: 'boolean', required: false, default: true, array: false },
      ],
      indexes: [
        { key: 'userId_isActive_idx', type: 'key', attributes: ['userId', 'isActive'], orders: ['ASC', 'ASC'] },
      ],
    },
    bloodworks: {
      id: appwriteEnvConfig.bloodworksCollectionId,
      name: 'Bloodwork Results',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'testName', type: 'string', required: true, size: 255, array: false },
        { key: 'summary', type: 'string', required: false, size: 5000, array: false },
        { key: 'recordedAt', type: 'datetime', required: true, array: false },
        { key: 'fileId', type: 'string', required: true, size: 255, array: false },
        { key: 'fileName', type: 'string', required: true, size: 255, array: false },
        { key: 'results', type: 'string', required: false, size: 10000, array: false, description: 'JSON string of extracted key-value pairs from the report' },
      ],
      indexes: [
        { key: 'userId_recordedAt_idx', type: 'key', attributes: ['userId', 'recordedAt'], orders: ['ASC', 'DESC'] },
      ],
    },
    forumTopics: {
      id: appwriteEnvConfig.forumTopicsCollectionId,
      name: 'Forum Topics',
      attributes: [
        { key: 'title', type: 'string', required: true, size: 255, array: false },
        { key: 'content', type: 'string', required: true, size: 65535, array: false },
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'userName', type: 'string', required: true, size: 255, array: false },
        { key: 'userAvatarUrl', type: 'string', required: false, size: 2048, array: false },
        { key: 'category', type: 'string', required: false, size: 100, array: false },
        { key: 'lastReplyAt', type: 'datetime', required: false, array: false },
        { key: 'replyCount', type: 'integer', required: false, default: 0, min: 0, array: false },
        { key: 'isLocked', type: 'boolean', required: false, default: false, array: false },
        { key: 'isPinned', type: 'boolean', required: false, default: false, array: false },
        { key: 'voteScore', type: 'integer', required: false, default: 0, array: false },
      ],
      indexes: [
        { key: 'lastReplyAt_desc_idx', type: 'key', attributes: ['lastReplyAt'], orders: ['DESC'] },
        { key: 'pinned_lastReply_idx', type: 'key', attributes: ['isPinned', 'lastReplyAt'], orders: ['DESC', 'DESC'] },
        { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
        { key: 'userId_idx', type: 'key', attributes: ['userId'], orders: ['ASC'] },
        { key: 'title_fulltext_idx', type: 'fulltext', attributes: ['title'], orders: [] },
        { key: 'voteScore_idx', type: 'key', attributes: ['voteScore'], orders: ['DESC'] },
        { key: 'title_fulltext', type: 'fulltext', attributes: ['title'], orders: [] },
        { key: 'content_fulltext', type: 'fulltext', attributes: ['content'], orders: [] },
      ],
    },
    forumPosts: {
      id: appwriteEnvConfig.forumPostsCollectionId,
      name: 'Forum Posts',
      attributes: [
        { key: 'topicId', type: 'string', required: true, size: 255, array: false },
        { key: 'content', type: 'string', required: true, size: 65535, array: false },
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'userName', type: 'string', required: true, size: 255, array: false },
        { key: 'userAvatarUrl', type: 'string', required: false, size: 2048, array: false },
        { key: 'voteScore', type: 'integer', required: false, default: 0, array: false },
      ],
      indexes: [
        { key: 'topicId_createdAt_asc_idx', type: 'key', attributes: ['topicId', '$createdAt'], orders: ['ASC', 'ASC'] },
        { key: 'userId_idx', type: 'key', attributes: ['userId'], orders: ['ASC'] },
        { key: 'content_fulltext', type: 'fulltext', attributes: ['content'], orders: [] },
        { key: 'topicId_voteScore_idx', type: 'key', attributes: ['topicId', 'voteScore'], orders: ['ASC', 'DESC'] },
      ],
    },
    forumVotes: {
      id: appwriteEnvConfig.forumVotesCollectionId,
      name: "Forum Votes",
      attributes: [
          { key: 'userId', type: 'string', required: true, size: 255, array: false },
          { key: 'targetId', type: 'string', required: true, size: 255, array: false },
          { key: 'targetType', type: 'string', required: true, size: 10, array: false },
          { key: 'voteType', type: 'string', required: true, size: 4, array: false },
      ],
      indexes: [
          { key: 'user_target_unique', type: 'unique', attributes: ['userId', 'targetId'], orders: ['ASC', 'ASC'] },
          { key: 'target_vote_idx', type: 'key', attributes: ['targetId', 'voteType'], orders: ['ASC', 'ASC'] },
          { key: 'user_idx', type: 'key', attributes: ['userId'], orders: ['ASC'] },
      ],
    },
    chatHistory: {
      id: appwriteEnvConfig.chatHistoryCollectionId,
      name: 'Chat History',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'sessionId', type: 'string', required: true, size: 255, array: false },
        { key: 'role', type: 'string', required: true, size: 10, array: false },
        { key: 'content', type: 'string', required: true, size: 65535, array: false },
        { key: 'timestamp', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_sessionId_timestamp_idx', type: 'key', attributes: ['userId', 'sessionId', 'timestamp'], orders: ['ASC', 'ASC', 'ASC'] },
        { key: 'userId_timestamp_idx', type: 'key', attributes: ['userId', 'timestamp'], orders: ['ASC', 'DESC'] },
      ],
    },
    bookmarks: {
      id: appwriteEnvConfig.bookmarksCollectionId,
      name: 'Bookmarked Messages',
      attributes: [
        { key: 'userId', type: 'string', required: true, size: 255, array: false },
        { key: 'messageContent', type: 'string', required: true, size: 65535, array: false },
        { key: 'bookmarkedAt', type: 'datetime', required: true, array: false },
      ],
      indexes: [
        { key: 'userId_bookmarkedAt_idx', type: 'key', attributes: ['userId', 'bookmarkedAt'], orders: ['ASC', 'DESC'] },
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