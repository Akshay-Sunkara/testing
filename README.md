# Context Extractor - Web Interface

A sleek, modern web interface for extracting comprehensive context from GitHub, Slack, websites, and databases with automatic file downloads. Perfect for providing LLMs with accurate context to minimize hallucination.

## 🚀 Quick Start

### Step 1: Start Backend Server

```bash
cd C:\Users\aksha\Desktop\Jira\first-bolt-app
python app.py --server
```

Or double-click `START_SERVER.bat`

### Step 2: Open Website

Frontend at http://localhost:5173

### Step 3: Extract Context

Choose from multiple sources:

#### 🐙 GitHub
1. Click "Extract GitHub"
2. Enter GitHub token, username, and optionally repository name
3. Downloads repository context with issues, PRs, and commits

#### 🔥 Firebase
1. Click "Firebase" in the Database Integrations section
2. Enter Project ID and Service Account Key (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
3. Downloads database structure, collections, and field types

#### 🌐 Website Documentation
1. Enter any website URL
2. Extracts all text content (handles JavaScript sites)
3. Perfect for API documentation and guides

#### 💬 Slack
1. Click "Extract Slack"
2. OAuth login to your workspace
3. Downloads all channel messages and conversations

## 📊 What Gets Extracted

### GitHub
- Repository metadata & README
- Latest 5 issues with comments
- Latest 5 pull requests with comments
- Latest 5 commits with **full code diffs**

### Firebase
- Firestore collections and document structures
- Field names and data types
- Sample documents (10 per collection)
- Realtime Database structure
- Authentication user counts

### Websites
- All text content from any webpage
- JavaScript-rendered content support
- Perfect for documentation sites

### Slack
- All channel messages
- Direct messages
- Thread conversations
- User information

## 🤖 Slack Bot (Separate Feature)

Want to extract Slack messages? Install the Slack bot directly to your workspace!

### How to Install Slack Bot:

See `Jira/first-bolt-app/SLACK_BOT_INSTALL.md` for complete instructions.

**Quick Summary:**
1. Start bot server: `python app.py --slack-bot`
2. Users install bot to their workspace via distribution URL
3. Mention bot: `@ContextBot extract`
4. Bot saves all messages to a file

**Note:** Slack extraction is NOT done through this website. It's a separate bot that users install to their Slack workspaces.

## ✨ Features

- 🎨 ChatGPT-style UI with smooth animations
- ⚡ Real-time extraction with loading states
- 💾 Automatic file downloads
- 🗃️ **NEW: Firebase database integration**
- 🌐 Website documentation extraction
- 💬 Slack workspace extraction
- 🐙 GitHub repository context
- 🎯 Context accumulator (combine multiple sources)
- ❌ Error handling with user-friendly messages
- 🎭 Modern design with hover effects

## 🔧 Tech Stack

**Frontend:**
- React 18 + Vite
- CSS3 animations & transitions
- Fetch API
- Responsive design

**Backend:**
- Flask (integrated into app.py)
- GitHub API integration
- Firebase Admin SDK
- Slack Bot (Socket Mode)
- Playwright (website scraping)
- BeautifulSoup4
- CORS enabled

**Database Support:**
- ✅ Firebase (Firestore + Realtime DB)
- 🔜 Supabase (coming soon)
- 🔜 MongoDB (coming soon)
- 🔜 PostgreSQL (coming soon)

## 📁 Output Files

### GitHub
`username_repo_context.txt` or `username_all_repos_context.txt`

### Firebase
`firebase_projectid_context.txt`

### Website
`domain_name_content.txt`

### Slack
`slack_workspacename_context.txt`

### Combined Context
`combined_context_timestamp.txt` (when using the context accumulator)

## 🔒 Security

- Tokens sent via POST (not stored)
- Backend runs locally (localhost:5000)
- CORS enabled only for localhost
- No external uploads

## 🔍 Troubleshooting

**Backend won't start:**
```bash
pip install -r requirements.txt
```

**"Unable to connect" error:**
- Make sure backend is running on port 5000
- Check terminal for Flask startup message

**GitHub "Authentication failed":**
- Verify token is valid
- For private repos: Token needs `repo` scope
- For public repos: Token needs `public_repo` scope

**Firebase "Admin SDK not installed":**
```bash
pip install firebase-admin
```

**Firebase "Failed to initialize":**
- Verify service account key JSON is valid
- Check project ID matches your Firebase project
- Ensure service account has necessary permissions
- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed setup

## 🎯 Use Cases

### For LLM-Assisted Development (Cursor, Copilot, etc.)

1. **Accurate Database Queries**
   - Extract Firebase schema → Get exact field names
   - No more hallucinated collection names
   - Type-safe suggestions

2. **API Integration**
   - Extract website docs → Accurate API endpoints
   - Correct parameter names
   - Up-to-date documentation

3. **Codebase Understanding**
   - Extract GitHub context → Understand patterns
   - See actual implementations
   - Learn project structure

4. **Team Communication**
   - Extract Slack context → Understand decisions
   - Historical context
   - Team preferences

### Example Workflow

```
1. Extract Firebase context → Get your database schema
2. Extract GitHub context → Get your code patterns  
3. Extract API docs → Get integration guides
4. Download combined context file
5. Feed to Cursor/Copilot
6. Get accurate, context-aware suggestions!
```

## 🚀 Roadmap

- [x] GitHub integration
- [x] Slack OAuth integration  
- [x] Website scraping
- [x] Firebase integration
- [x] Context accumulator
- [ ] Supabase integration
- [ ] MongoDB integration
- [ ] PostgreSQL integration
- [ ] MySQL integration
- [ ] Export to JSON/Markdown
- [ ] Context preview in UI
- [ ] Filter/search extracted context

## 🤝 Contributing

Want to add more database providers? Here's how:

1. **Backend**: Add extraction function in `app.py`
2. **Frontend**: Add button in `PromptBar.jsx`
3. **Styling**: Add styles in `PromptBar.css`
4. **Documentation**: Update README

See `FIREBASE_SETUP.md` as an example implementation.

---

**Made with ❤️ to help developers vibecode with databases and eliminate LLM hallucination**
