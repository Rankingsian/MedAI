# Database Setup Guide

This guide explains how to set up the MedAI database from scratch using Firestore.

---

## Prerequisites

1. **Firebase Project**: Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. **Firestore Database**: Enable Firestore in your Firebase project
3. **Service Account Key**: Download your Firebase Admin SDK service account key
4. **Python Environment**: Python 3.8+ with firebase-admin installed

---

## Quick Setup

### 1. Configure Firebase Credentials

Place your Firebase service account key JSON file in the backend directory:

```bash
# Backend directory structure
backend/
  ├── firebase-credentials.json  # Your service account key
  ├── .env
  └── database_setup.py
```

Or set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase-credentials.json"
```

### 2. Install Dependencies

```bash
cd backend
pip install firebase-admin
```

### 3. Run Setup Script

```bash
# Initialize collections and show index commands
python database_setup.py --init

# Create sample data for testing
python database_setup.py --sample

# Do both
python database_setup.py --all

# Clear sample data
python database_setup.py --clear
```

---

## Manual Setup Steps

### Step 1: Create Collections

Firestore creates collections automatically when the first document is added. The setup script will guide you through the required collections:

- **users** - Patient accounts
- **clinicians** - Doctor profiles
- **consultations** - AI consultation sessions
- **consultation_requests** - Appointment requests
- **video_calls** - Video call sessions
- **lab_reports** - Uploaded lab reports

### Step 2: Create Indexes

**Important**: Firestore requires composite indexes for complex queries. Create these indexes in the Firebase Console:

#### Via Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Create Index** for each of the following:

**Index 1: consultations**
- Collection ID: `consultations`
- Fields:
  - `user_id` (Ascending)
  - `last_updated` (Descending)

**Index 2: consultation_requests (user queries)**
- Collection ID: `consultation_requests`
- Fields:
  - `user_id` (Ascending)
  - `created_at` (Descending)

**Index 3: consultation_requests (clinician queries)**
- Collection ID: `consultation_requests`
- Fields:
  - `clinician_id` (Ascending)
  - `status` (Ascending)

**Index 4: consultation_requests (status queries)**
- Collection ID: `consultation_requests`
- Fields:
  - `status` (Ascending)
  - `created_at` (Descending)

**Index 5: video_calls (patient queries)**
- Collection ID: `video_calls`
- Fields:
  - `patient_id` (Ascending)
  - `scheduled_time` (Descending)

**Index 6: video_calls (clinician queries)**
- Collection ID: `video_calls`
- Fields:
  - `clinician_id` (Ascending)
  - `scheduled_time` (Descending)

**Index 7: lab_reports**
- Collection ID: `lab_reports`
- Fields:
  - `user_id` (Ascending)
  - `uploaded_at` (Descending)

#### Via Firebase CLI:

Create a `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "consultations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "last_updated", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "consultation_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "consultation_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clinician_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "consultation_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "video_calls",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patient_id", "order": "ASCENDING" },
        { "fieldPath": "scheduled_time", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "video_calls",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clinician_id", "order": "ASCENDING" },
        { "fieldPath": "scheduled_time", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "lab_reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "uploaded_at", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:

```bash
firebase deploy --only firestore:indexes
```

### Step 3: Configure Security Rules

In Firebase Console, go to **Firestore Database** > **Rules** and paste the security rules from `DATABASE_SCHEMA.md`.

Or create a `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isClinician() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/clinicians/$(request.auth.uid));
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId);
    }
    
    match /clinicians/{clinicianId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(clinicianId);
    }
    
    match /consultations/{consultationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      
      match /messages/{messageId} {
        allow read, write: if isAuthenticated();
      }
      
      match /clinical_notes/{noteId} {
        allow read: if isAuthenticated();
        allow write: if isClinician();
      }
    }
    
    match /consultation_requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      
      match /notes/{noteId} {
        allow read: if isAuthenticated();
        allow write: if isClinician();
      }
    }
    
    match /video_calls/{callId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
    
    match /lab_reports/{reportId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
  }
}
```

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

---

## Testing the Setup

### 1. Create Test Users

In Firebase Console > Authentication:

1. Enable Email/Password authentication
2. Create test users:
   - Patient: `patient@example.com`
   - Doctor: `doctor@example.com`

### 2. Run Sample Data Script

```bash
python database_setup.py --sample
```

This creates:
- Sample patient and clinician documents
- Sample consultation with messages
- Sample consultation requests
- Sample video call

### 3. Verify in Firebase Console

Check Firestore Database to see the created documents.

### 4. Test the Application

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Visit `http://localhost:5173` and log in with test credentials.

---

## Migrating Existing Data

If you have existing data in another database:

### From SQL Database:

1. Export data to JSON format
2. Create a migration script using the structure in `database_setup.py`
3. Import data using Firebase Admin SDK

Example migration script:

```python
import firebase_admin
from firebase_admin import firestore
import json

db = firestore.client()

# Load your JSON data
with open('users_export.json', 'r') as f:
    users = json.load(f)

# Import to Firestore
for user in users:
    db.collection('users').document(user['id']).set(user)
```

### From MongoDB:

```python
from pymongo import MongoClient
import firebase_admin
from firebase_admin import firestore

# Connect to MongoDB
mongo_client = MongoClient('mongodb://localhost:27017/')
mongo_db = mongo_client['medai']

# Connect to Firestore
firebase_db = firestore.client()

# Migrate users
for user in mongo_db.users.find():
    user['_id'] = str(user['_id'])  # Convert ObjectId
    firebase_db.collection('users').document(user['_id']).set(user)
```

---

## Backup and Restore

### Automated Backups

Set up automated Firestore backups in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **Firestore** > **Import/Export**
4. Set up scheduled exports to Cloud Storage

### Manual Export

```bash
gcloud firestore export gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

### Manual Import

```bash
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

---

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Solution**: Check Firestore security rules and ensure user is authenticated.

### Issue: "The query requires an index"

**Solution**: Create the required composite index in Firebase Console or using the indexes file.

### Issue: "Firebase Admin SDK not initialized"

**Solution**: Ensure `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set or credentials file is in the correct location.

### Issue: "Collection not found"

**Solution**: Collections are created automatically when first document is added. Try creating a document first.

---

## Production Considerations

1. **Security Rules**: Review and tighten security rules for production
2. **Indexes**: Monitor query performance and add indexes as needed
3. **Backups**: Set up automated daily backups
4. **Monitoring**: Enable Firestore monitoring in Google Cloud Console
5. **Quotas**: Monitor Firestore usage and set up billing alerts
6. **Data Validation**: Use Cloud Functions to validate data on write
7. **Rate Limiting**: Implement rate limiting for API endpoints

---

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Indexing Best Practices](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)

---

## Support

For issues with database setup, check:
1. Firebase Console for error messages
2. Backend logs for detailed error information
3. `DATABASE_SCHEMA.md` for complete schema reference
