# 🔥 Firebase Integration - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Install Firebase Admin SDK
```bash
cd C:\Users\aksha\Desktop\Jira\first-bolt-app
pip install firebase-admin
```

### Step 2: Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click ⚙️ Settings → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Copy the **Project ID** (shown at the top)

### Step 3: Start the Servers

**Backend:**
```bash
cd C:\Users\aksha\Desktop\Jira\first-bolt-app
python app.py --server
```

**Frontend:**
```bash
cd C:\Users\aksha\Desktop\Jira-Website
npm run dev
```

### Step 4: Extract Firebase Context

1. Open http://localhost:5173
2. Scroll down to **"or connect to your database"**
3. Click the **Firebase** button (orange icon)
4. Fill in the form:
   - **Firebase Project ID**: Paste your project ID
   - **Service Account Key**: Open the downloaded JSON file, copy ALL the contents, paste it
5. Click **"Extract Firebase Context"**
6. Wait for the extraction (5-30 seconds depending on size)
7. File downloads automatically!

### Step 5: Use the Context

1. Open the downloaded `.txt` file
2. Copy the contents
3. Paste into Cursor chat or add to your context
4. Now ask questions like:
   - "Write a query to get all users"
   - "Create a function to add a new post"
   - "How do I update the user profile?"

Cursor will use your EXACT field names and collection names! 🎯

## 📋 What You'll Get

Your context file will include:

```
====================================================================================================
                                   FIREBASE PROJECT CONTEXT
====================================================================================================

SUMMARY
----------------------------------------------------------------------------------------------------
Project ID: my-awesome-app
Generated: 2025-11-12T...
Total Collections: 5
Total Documents Sampled: 50
Auth Users: 150

====================================================================================================
                                   FIRESTORE COLLECTIONS
====================================================================================================

COLLECTION: users
----------------------------------------------------------------------------------------------------
Document Count: 10

Sample Documents:

  Document ID: user123
  Fields: email, displayName, photoURL, createdAt, role, isVerified
  Field Types:
    - email: str
    - displayName: str
    - photoURL: str
    - createdAt: Timestamp
    - role: str
    - isVerified: bool

  Document ID: user456
  ...
```

## 💡 Pro Tips

### Tip 1: Combine Multiple Sources
Don't click "Extract" immediately! Use the context accumulator:
1. Extract GitHub context (your code)
2. Extract Firebase context (your database)
3. Extract API docs (your dependencies)
4. Click **"Download Context"** to combine everything
5. Feed the combined file to Cursor

### Tip 2: Regular Updates
Re-extract context when you:
- Add new collections
- Change schema
- Add new fields
- Modify security rules

### Tip 3: Security
- ⚠️ Never commit the service account JSON to git
- ⚠️ Don't share the extracted context publicly (it may contain sensitive data)
- ✅ Extract context locally
- ✅ Use environment variables for production

### Tip 4: Large Databases
If you have many collections:
- Extraction samples only 10 documents per collection
- This is enough for schema understanding
- Keeps files manageable
- Fast extraction

## 🎯 Example Prompts to Use After

Once you have the context:

**Creating**
```
"Create a function to add a new user with all the required fields"
```

**Querying**
```
"Write a query to get all posts from the last 7 days"
```

**Updating**
```
"Show me how to update the user's email and displayName"
```

**Validation**
```
"Create a validation schema for the products collection"
```

**Types**
```
"Generate TypeScript interfaces for all my collections"
```

## 🐛 Troubleshooting

**"Firebase Admin SDK not installed"**
```bash
pip install firebase-admin
```

**"Invalid service account key JSON format"**
- Make sure you copied the ENTIRE JSON file contents
- It should start with `{` and end with `}`
- Should include quotes around keys

**"Failed to initialize Firebase"**
- Check that your project ID is correct
- Verify the service account key is from the same project
- Make sure the service account has permissions

**No collections appearing**
- Verify your database has data in Firestore
- Check the service account has Firestore read permissions
- Try creating a test collection in Firebase Console

**"Could not access Auth/Database"**
- Some features require Firebase Blaze plan
- Auth access requires specific IAM permissions
- You'll still get Firestore data regardless

## 🎉 Success!

You're now ready to vibecode with databases! Your LLM assistant has:
- ✅ Exact collection names
- ✅ Exact field names
- ✅ Correct data types
- ✅ Real document structure

No more hallucinated collection names or wrong field types!

## 🔜 Coming Soon

- Supabase integration
- MongoDB integration
- PostgreSQL integration
- MySQL integration

Want to add a database provider? See `IMPLEMENTATION_SUMMARY.md` for the pattern!

---

**Happy coding! 🚀**

Need help? Check out the full guide: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

