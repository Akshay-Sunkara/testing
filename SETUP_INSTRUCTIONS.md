# ✅ Frontend Setup Complete!

I've updated your frontend code to use the ngrok URL. Now follow these final steps:

## 📝 Step 1: Create .env File

Create a file named `.env` in the **root** of your frontend project:

**Location:** `C:\Users\aksha\Desktop\Jira-Website\.env`

**Contents:**
```
VITE_API_URL=https://59511825561f.ngrok-free.app
```

## 🔄 Step 2: Restart Your Frontend

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## ✨ What Changed

I updated these files:

1. **Created `src/config.js`** - Central config for API URL
2. **Updated `src/components/PromptBar.jsx`** - All 6 API endpoints now use the config:
   - ✅ GitHub extraction
   - ✅ Slack OAuth
   - ✅ Website extraction
   - ✅ Firebase extraction
   - ✅ Supabase extraction
   - ✅ Slack callback

## 🧪 Test It Works

After restarting your frontend, open the browser console and you should see:

```
🌐 API Base URL: https://59511825561f.ngrok-free.app
```

Then try any extraction and it should work without CORS errors! 🎉

## 🔄 When ngrok URL Changes

Your ngrok URL will change every time you restart the backend server. When that happens:

1. Get the new URL:
```bash
curl http://localhost:5000/api/config
```

2. Update `.env` with the new URL:
```
VITE_API_URL=https://NEW_URL_HERE.ngrok-free.app
```

3. Restart frontend:
```bash
npm run dev
```

## ✅ Quick Checklist

- [ ] Created `.env` file with `VITE_API_URL=https://59511825561f.ngrok-free.app`
- [ ] Restarted frontend (`npm run dev`)
- [ ] Checked browser console shows correct API URL
- [ ] Tested an extraction (GitHub, Website, etc.)
- [ ] No more CORS errors! 🎉

---

**Your Current ngrok URL:** `https://59511825561f.ngrok-free.app`

All set! Your frontend will now connect to your EC2 server via ngrok! 🚀

