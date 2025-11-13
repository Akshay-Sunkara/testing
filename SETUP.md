# 🚀 Setup Guide

## Quick Start

### Step 1: Start Backend Server

Open a terminal and run:
```bash
cd C:\Users\aksha\Desktop\Jira\first-bolt-app
python app.py --server
```

You should see:
```
🚀 GITHUB CONTEXT EXTRACTOR - API SERVER MODE
================================================================================
   Backend API: http://localhost:5000
   Frontend UI: http://localhost:5173
================================================================================

✅ Server started! Waiting for extraction requests...
```

**Keep this terminal open!**

### Step 2: Frontend is Already Running

The React frontend is already running at http://localhost:5173

### Step 3: Use the Website

1. Open http://localhost:5173 in your browser
2. Click the prompt bar to expand the form
3. Fill in:
   - **GitHub Token**: Your personal access token (from https://github.com/settings/tokens)
   - **Username/Org**: e.g., "octocat" or "facebook"
   - **Repository**: (optional) e.g., "react" - leave empty for all repos
4. Click "Extract Context"
5. Watch the backend terminal show real-time progress
6. File automatically downloads to your Downloads folder!

## 📋 What Happens When You Extract

```
Frontend (React)
    ↓ POST /api/extract
Backend (app.py Flask Server)
    ↓ Calls get_context_github()
GitHub API
    ↓ Returns: README, Issues, PRs, Commits with code diffs
Backend
    ↓ Saves to .txt file
    ↓ Sends file as download
Frontend
    ↓ Triggers browser download
Your Downloads Folder ✅
```

## 📁 Output Files

Files are saved in two locations:
1. **Backend**: `Jira/first-bolt-app/context_outputs/` (for reference)
2. **Downloaded**: Your browser's Downloads folder (for you to use)

Filename format:
- Single repo: `username_reponame_context.txt`
- All repos: `username_all_repos_context.txt`

## 🔍 Troubleshooting

### Backend won't start?
```bash
# Install Flask dependencies
pip install flask flask-cors
```

### Frontend can't connect?
- Make sure backend is running on port 5000
- Check terminal for error messages
- Try refreshing the browser

### Invalid GitHub token?
- Generate a new token at https://github.com/settings/tokens
- For private repos: Select "repo" scope
- For public repos: Select "public_repo" scope

## 🎯 Example Usage

**Extract all repos from user "octocat":**
- Token: `ghp_xxxxxxxxxxxx`
- Username: `octocat`
- Repository: (leave empty)

**Extract specific repo "facebook/react":**
- Token: `ghp_xxxxxxxxxxxx`
- Username: `facebook`
- Repository: `react`

## 💡 CLI Mode (Optional)

You can still use app.py as a command-line tool:
```bash
python app.py --token YOUR_TOKEN --user octocat --repo hello-world
```

For API server mode, use:
```bash
python app.py --server
```
