# Firebase Integration Setup Guide

## Overview

The Firebase integration allows you to extract comprehensive context from your Firebase project, including:
- 🗃️ Firestore database structure and collections
- 📊 Sample documents with field types
- 👥 Firebase Authentication user counts
- 💾 Realtime Database structure
- 🔐 Project configuration

This context helps LLMs like Cursor better understand your database schema and provide more accurate suggestions with minimal hallucination.

## Prerequisites

1. A Firebase project (create one at [console.firebase.google.com](https://console.firebase.google.com))
2. Admin access to the Firebase project
3. Python backend server running

## Setup Instructions

### Step 1: Install Firebase Admin SDK

In the backend directory, install the required package:

```bash
cd C:\Users\aksha\Desktop\Jira\first-bolt-app
pip install firebase-admin
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

### Step 2: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the ⚙️ Settings icon → **Project settings**
4. Navigate to the **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Keep this file secure! It contains sensitive credentials

### Step 3: Get Your Project ID

1. In Firebase Console → Project settings
2. Your **Project ID** is displayed at the top
3. Example: `my-awesome-project-123`

### Step 4: Using the Integration

1. Start your backend server:
   ```bash
   cd C:\Users\aksha\Desktop\Jira\first-bolt-app
   python app.py --server
   ```

2. Start your frontend:
   ```bash
   cd C:\Users\aksha\Desktop\Jira-Website
   npm run dev
   ```

3. Open the web interface at http://localhost:5173

4. Click the **Firebase** button in the "Database Integrations" section

5. Fill in the form:
   - **Firebase Project ID**: Your project ID from Step 3
   - **Service Account Key**: Paste the entire JSON content from Step 2
   - **Email/Password** (optional): For Firebase Authentication testing

6. Click **Extract Firebase Context**

7. The context will be downloaded as a `.txt` file containing:
   - All collection names
   - Sample documents (up to 10 per collection)
   - Field names and types
   - Database structure
   - Auth user counts

## What Gets Extracted

### Firestore Collections
```
COLLECTION: users
Document Count: 10

Sample Documents:
  Document ID: user123
  Fields: email, displayName, createdAt, isVerified
  Field Types:
    - email: str
    - displayName: str
    - createdAt: Timestamp
    - isVerified: bool
```

### Realtime Database
```
Top-level keys: config, users, posts, analytics
Data type: dict
```

### Authentication
```
Auth Users: 150
```

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit service account keys** to version control
2. Store keys securely (use environment variables or secure vaults)
3. Rotate keys periodically
4. Use keys with minimal required permissions
5. Delete unused service accounts

## Troubleshooting

### "Firebase Admin SDK not installed"
- Run: `pip install firebase-admin`

### "Failed to initialize Firebase"
- Verify your service account key JSON is valid
- Ensure the project ID matches your Firebase project
- Check that the service account has necessary permissions

### "Could not access Auth/Database"
- Some features require specific Firebase plan (Blaze plan for Realtime Database)
- Verify your service account has the necessary IAM roles

### No collections showing up
- Make sure your Firestore database has data
- Verify the service account has Firestore read permissions
- Check that you're using Firestore (not Realtime Database only)

## Adding More Databases

The system is designed to be extensible. You can add:
- ✅ Firebase (implemented)
- 🔜 Supabase (coming soon)
- 🔜 MongoDB
- 🔜 PostgreSQL
- 🔜 MySQL

## Use Cases

### 1. Better Code Suggestions
Feed the extracted context to Cursor/Copilot for:
- Accurate query generation
- Proper field names
- Type-safe operations

### 2. Documentation
Generate up-to-date database documentation

### 3. Schema Analysis
Understand your database structure at a glance

### 4. Migration Planning
Analyze current schema before migrations

### 5. Onboarding
Help new developers understand the database structure quickly

## Example Context Output

The generated context file provides LLMs with:
- Exact collection and field names (no hallucination)
- Field data types
- Relationships between collections
- Authentication configuration
- Database size metrics

This allows AI assistants to:
- Generate correct Firestore queries
- Suggest proper field names
- Understand data relationships
- Provide accurate security rules suggestions

## API Endpoint

For programmatic access:

```bash
POST http://localhost:5000/api/extract/firebase
Content-Type: application/json

{
  "projectId": "my-project-id",
  "serviceAccountKey": "{...json...}",
  "email": "optional@example.com",
  "password": "optional"
}
```

Response: Downloads a `.txt` file with the complete context.

## Contributing

Want to improve the Firebase integration or add more database providers?
1. Fork the repository
2. Add your database extractor in `app.py`
3. Create the UI component in `PromptBar.jsx`
4. Submit a pull request

---

**Made with ❤️ to help developers vibecode with databases**

